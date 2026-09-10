#!/usr/bin/env node
/*
 * `npm run new-post` — maakt een correct gevormd Markdown-bestand met de
 * datum van vandaag (§14), zodat een post beginnen nooit betekent dat je
 * frontmatter uit een ander bestand moet kopiëren.
 *
 * Gebruik:
 *   npm run new-post -- "Rockstar confirms the second trailer"
 *   npm run new-post -- "Fastest cars in GTA Online" --guide --game gta-online
 *
 * Schrijft altijd naar de Engelse map: Engels is de brontaal (§11). De vijf
 * vertalingen maakt `npm run translate` daarna.
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const GAMES = ['gta5', 'gta-online', 'trilogy', 'gta6'];

/** Titel naar slug: kleine letters, koppeltekens, geen accenten. */
function slugify(title) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

/** Een waarde die veilig tussen aanhalingstekens in YAML past. */
function quote(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function parseArgs(argv) {
  const args = { title: '', guide: false, game: '', slug: '' };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--guide') args.guide = true;
    else if (arg === '--game') args.game = argv[++i] ?? '';
    else if (arg === '--slug') args.slug = argv[++i] ?? '';
    else if (!arg.startsWith('--') && !args.title) args.title = arg;
  }

  return args;
}

const args = parseArgs(process.argv.slice(2));

if (!args.title) {
  console.error('Geef een titel mee: npm run new-post -- "De titel van de post"');
  console.error('Een gids: npm run new-post -- "Titel" --guide --game gta-online');
  process.exit(1);
}

if (args.guide && !GAMES.includes(args.game)) {
  console.error(`Een gids heeft --game nodig, een van: ${GAMES.join(', ')}`);
  process.exit(1);
}

const collection = args.guide ? 'guides' : 'news';
const slug = args.slug ? slugify(args.slug) : slugify(args.title);

if (!slug) {
  console.error('Uit die titel komt geen bruikbare slug. Geef er een mee met --slug.');
  process.exit(1);
}

/** De datum van vandaag, lokaal, als 2026-09-10. */
const today = new Date();
const date = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, '0'),
  String(today.getDate()).padStart(2, '0'),
].join('-');

const root = path.resolve(process.cwd(), 'src/content', collection, 'en');
const file = path.join(root, `${slug}.md`);

try {
  await access(file);
  console.error(`Bestaat al: src/content/${collection}/en/${slug}.md`);
  process.exit(1);
} catch {
  // Bestaat nog niet; dat is precies de bedoeling.
}

/*
 * De frontmatter staat er voluit in, ook de velden die leeg blijven. Dan is
 * meteen zichtbaar wat er ingevuld kan worden, en hoeft niemand de spec of
 * het schema erbij te halen.
 *
 * `image` staat als commentaar klaar met het juiste relatieve pad: Astro
 * zoekt het beeld vanaf dit bestand, niet vanaf de wortel van het project.
 */
const frontmatter = [
  '---',
  `title: ${quote(args.title)}`,
  'description: ""',
  `date: ${date}`,
  ...(args.guide ? [`game: ${args.game}`] : []),
  '# Zet het beeld in src/assets/posts/ en haal deze twee regels uit commentaar.',
  `# image: ../../../assets/posts/${slug}.jpg`,
  '# imageAlt: ""',
  'source: ""',
  'sourceUrl: ""',
  'tags: []',
  '# featured: true zet deze post groot links op de homepage.',
  'featured: false',
  '# Zolang dit true is, wordt de post niet gebouwd en niet geïndexeerd.',
  'draft: true',
  '---',
  '',
  'Schrijf hier de post. Korte alinea\'s, duidelijke koppen, scanbaar op een',
  'telefoon (§14.1). Eigen woorden en eigen beelden, nooit materiaal van',
  'Rockstar.',
  '',
].join('\n');

await mkdir(root, { recursive: true });
await writeFile(file, frontmatter, 'utf8');

console.log(`Aangemaakt: src/content/${collection}/en/${slug}.md`);
console.log(`Pad op de site: /${collection}/${slug}`);
console.log('Zet draft op false zodra hij klaar is, en draai dan npm run translate.');
