#!/usr/bin/env node
/*
 * `npm run map:update` — haalt een nieuwe versie van de kaart binnen.
 *
 * Eén commando dat drie dingen doet:
 *
 *   1. de tegels van de gevraagde versie ophalen;
 *   2. de oude tegels weggooien, zodat het repo niet elke keer aandikt;
 *   3. versie, datum en grenzen in src/data/map.ts bijwerken.
 *
 * Grootte, grenzen en datum komen uit hun yanis.json. Tot v15 waren die
 * altijd dezelfde; v16 (20 september 2026) is 1000 breder en schuift de
 * grenzen op, en toen bleek dat alleen het versienummer bijwerken de hele
 * kaart laat verspringen. De plaatsen zelf houden hun coördinaten: nagemeten
 * op 29 september 2026 door v15 en v16 over elkaar te leggen.
 *
 * De basiskaart is de gemeenschapskaart YANIS op map.stateofleonida.net.
 * Nutri heeft daar op 10 september 2026 toestemming voor van de mensen
 * achter die site.
 *
 * Gebruik:
 *   npm run map:update -- --version v16
 *   npm run map:update -- --version v16 --max-zoom 5   # lichter
 *   npm run map:update -- --check                      # welke versie is er?
 *
 * Na afloop: `npm run dev`, kijken of de gebieden nog op hun plek liggen
 * (een nieuwe versie kan de kustlijn verschuiven), en dan promoten.
 */

import { spawn } from 'node:child_process';
import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const CONFIG = path.join(root, 'src/data/map.ts');
const TILES = path.join(root, 'public/map/tiles');
const TOOL = path.join(root, 'scripts/fetch_map_tiles.py');
const SOURCE = 'https://map.stateofleonida.net/data/maps/yanis.json';

function parseArgs(argv) {
  const args = { version: '', maxZoom: '6', check: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--version') args.version = argv[++i] ?? '';
    else if (argv[i] === '--max-zoom') args.maxZoom = argv[++i] ?? '6';
    else if (argv[i] === '--check') args.check = true;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

/** Wat staat er nu in src/data/map.ts? */
async function currentVersion() {
  const text = await readFile(CONFIG, 'utf8');
  return text.match(/export const version = '([^']+)'/)?.[1] ?? '?';
}

/** Hun beschrijving van de kaart, met alle versies. */
async function source() {
  return fetch(SOURCE, {
    headers: { 'User-Agent': 'megamundo.be map updater' },
  }).then((r) => r.json());
}

/** Wat is de nieuwste versie op hun site? */
async function latestVersion() {
  const data = await source();
  return { current: data.currentVersion, versions: data.versions.map((v) => v.id) };
}

const here = await currentVersion();

if (args.check) {
  const remote = await latestVersion();
  console.log(`In dit repo:   ${here}`);
  console.log(`Op hun site:   ${remote.current}`);
  console.log(`Beschikbaar:   ${remote.versions.join(', ')}`);
  console.log(
    here === remote.current
      ? 'Je bent bij.'
      : `Bijwerken met: npm run map:update -- --version ${remote.current.replace('.0', '')}`,
  );
  process.exit(0);
}

if (!args.version) {
  console.error('Geef de versie mee, bijvoorbeeld: npm run map:update -- --version v16');
  console.error(`Weet je niet welke? npm run map:update -- --check   (nu: ${here})`);
  process.exit(1);
}

/*
 * Het versienummer in de configuratie is de lange vorm: `currentVersion` in
 * hun bestand heet v16.0 terwijl het tegelpad v16 gebruikt. De lange vorm
 * komt onder de kaart te staan.
 */
const long = args.version.includes('.') ? args.version : `${args.version}.0`;
const entry = (await source()).versions.find((v) => v.id === long);
if (!entry) {
  console.error(`Versie ${long} staat niet in ${SOURCE}.`);
  process.exit(1);
}
const { width, height } = entry.originalSize;

/*
 * Eerst de oude tegels weg. Anders staan er twee versies door elkaar en is
 * niet meer te zien welke tegel bij welke kaart hoort; de mappen heten
 * alleen naar het zoomniveau.
 */
console.log(`Oude tegels weggooien (${here})...`);
await rm(TILES, { recursive: true, force: true });

console.log(`Tegels ophalen voor ${args.version}, zoom 0 tot ${args.maxZoom}...`);
const code = await new Promise((resolve) => {
  spawn('python3', [
    TOOL, '--version', args.version.replace(/\.0$/, ''), '--max-zoom', args.maxZoom,
    '--width', String(width), '--height', String(height),
  ], {
    stdio: 'inherit',
  }).on('close', resolve);
});

if (code !== 0) {
  console.error('Het ophalen is misgelukt. De oude tegels zijn al weg, dus draai dit opnieuw.');
  process.exit(1);
}

/*
 * Versie, datum en grenzen in de configuratie bijwerken. De grenzen bepalen
 * waar Leaflet en de app de linkerbovenhoek van het tegelraster leggen; met
 * de oude grenzen en nieuwe tegels verspringt de hele kaart.
 */
const [[minY, minX], [maxY, maxX]] = entry.bounds;
let config = await readFile(CONFIG, 'utf8');
for (const [pattern, value] of [
  [/export const version = '[^']+'/, `export const version = '${long}'`],
  [/export const versionDate = '[^']+'/, `export const versionDate = '${entry.date}'`],
  [
    /export const fullBounds: \[\[number, number\], \[number, number\]\] = \[[^;]+\];/,
    `export const fullBounds: [[number, number], [number, number]] = [\n  [${minY}, ${minX}],\n  [${maxY}, ${maxX}],\n];`,
  ],
]) {
  if (!pattern.test(config)) {
    console.error(`Niet gevonden in src/data/map.ts: ${pattern}`);
    process.exit(1);
  }
  config = config.replace(pattern, value);
}
await writeFile(CONFIG, config, 'utf8');

console.log(`Klaar. src/data/map.ts staat nu op ${long} (${entry.date}), ${width} bij ${height},`);
console.log(`grenzen x ${minX} tot ${maxX}, y ${minY} tot ${maxY}.`);
console.log('Kijk met npm run dev of de gebieden nog op hun plek liggen: een');
console.log('nieuwe versie kan de kustlijn verschuiven, en dan kloppen de');
console.log('klikvlakken in src/content/game/*/ niet meer.');
