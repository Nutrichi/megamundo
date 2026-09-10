#!/usr/bin/env node
/*
 * `npm run map:update` — haalt een nieuwe versie van de kaart binnen.
 *
 * Eén commando dat drie dingen doet:
 *
 *   1. de tegels van de gevraagde versie ophalen;
 *   2. de oude tegels weggooien, zodat het repo niet elke keer aandikt;
 *   3. het versienummer in src/data/map.ts bijwerken.
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

/** Wat is de nieuwste versie op hun site? */
async function latestVersion() {
  const data = await fetch(SOURCE, {
    headers: { 'User-Agent': 'megamundo.be map updater' },
  }).then((r) => r.json());
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
 * Eerst de oude tegels weg. Anders staan er twee versies door elkaar en is
 * niet meer te zien welke tegel bij welke kaart hoort; de mappen heten
 * alleen naar het zoomniveau.
 */
console.log(`Oude tegels weggooien (${here})...`);
await rm(TILES, { recursive: true, force: true });

console.log(`Tegels ophalen voor ${args.version}, zoom 0 tot ${args.maxZoom}...`);
const code = await new Promise((resolve) => {
  spawn('python3', [TOOL, '--version', args.version, '--max-zoom', args.maxZoom], {
    stdio: 'inherit',
  }).on('close', resolve);
});

if (code !== 0) {
  console.error('Het ophalen is misgelukt. De oude tegels zijn al weg, dus draai dit opnieuw.');
  process.exit(1);
}

/*
 * Het versienummer in de configuratie bijwerken. `currentVersion` in hun
 * bestand heet v15.0 terwijl het tegelpad v15 gebruikt; hier staat de lange
 * vorm, want die komt onder de kaart te staan.
 */
const long = args.version.includes('.') ? args.version : `${args.version}.0`;
const config = await readFile(CONFIG, 'utf8');
await writeFile(
  CONFIG,
  config.replace(/export const version = '[^']+'/, `export const version = '${long}'`),
  'utf8',
);

console.log(`Klaar. src/data/map.ts staat nu op ${long}.`);
console.log('Kijk met npm run dev of de gebieden nog op hun plek liggen: een');
console.log('nieuwe versie kan de kustlijn verschuiven, en dan kloppen de');
console.log('klikvlakken in src/content/game/*/ niet meer.');
