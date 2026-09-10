#!/usr/bin/env node
/*
 * `npm run translate` — de vertaalpijplijn uit §11.1.
 *
 * Nutri schrijft elke post in het Engels; dit script maakt de vijf andere
 * talen. Het leest de Engelse Markdown, vertaalt titel, samenvatting,
 * alt-tekst en tekst met de Anthropic API, en schrijft het resultaat naar de
 * taalmap ernaast.
 *
 * Vier regels die het script hard aanhoudt:
 *
 * 1. Een vertaling met `manual: true` wordt NOOIT overschreven. Wie met de
 *    hand heeft bijgewerkt, houdt zijn tekst.
 * 2. Een ongewijzigde post wordt niet opnieuw vertaald. Per bronbestand
 *    staat er een hash in translations.lock.json; is die gelijk, dan slaat
 *    het script de post over.
 * 3. Alleen tekst gaat naar de API. Datum, beeld, bron, tags en vlaggen
 *    worden overgenomen uit de bron, zodat een vertaling nooit stilletjes
 *    een ander beeld of een andere datum krijgt.
 * 4. Bij een fout op één post stopt het script niet; het meldt de post en
 *    gaat door. Wat niet vertaald is, valt op de site terug op het Engels.
 *
 * De sleutel komt uit een .env die niet in git gaat:
 *   ANTHROPIC_API_KEY=sk-ant-...
 *
 * Vlaggen:
 *   --force          negeer de hashes en vertaal alles opnieuw
 *   --lang nl,fr     alleen deze talen
 *   --slug <slug>    alleen deze ene post
 *   --dry            toon wat er zou gebeuren, roep de API niet aan
 */

import { readdir, readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import Anthropic from '@anthropic-ai/sdk';

/** De vijf doeltalen; Engels is de bron (§11). */
const TARGETS = {
  nl: 'Dutch',
  fr: 'French',
  es: 'Spanish',
  it: 'Italian',
  de: 'German',
};

const COLLECTIONS = ['news', 'guides', 'game'];
const MODEL = 'claude-opus-5';
const LOCKFILE = 'translations.lock.json';

/* --- Argumenten --- */

function parseArgs(argv) {
  const args = { force: false, langs: Object.keys(TARGETS), slug: '', dry: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--force') args.force = true;
    else if (arg === '--dry') args.dry = true;
    else if (arg === '--slug') args.slug = argv[++i] ?? '';
    else if (arg === '--lang') {
      args.langs = (argv[++i] ?? '')
        .split(',')
        .map((lang) => lang.trim())
        .filter((lang) => lang in TARGETS);
    }
  }

  return args;
}

const args = parseArgs(process.argv.slice(2));

if (args.langs.length === 0) {
  console.error(`Onbekende taal. Kies uit: ${Object.keys(TARGETS).join(', ')}`);
  process.exit(1);
}

/* --- Frontmatter, zonder extra afhankelijkheid --- */

/**
 * Splitst een Markdown-bestand in de frontmatterregels en de tekst.
 * Bewust regelgericht en niet een volledige YAML-parser: we hoeven de
 * waarden niet te begrijpen, alleen twee regels te vervangen en de rest
 * onaangeroerd door te geven.
 */
function splitFile(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  return { front: match[1].split(/\r?\n/), body: match[2] };
}

/** De waarde van een frontmatterveld op het hoogste niveau. */
function readField(lines, key) {
  const line = lines.find((entry) => entry.startsWith(`${key}:`));
  if (!line) return undefined;
  const value = line.slice(key.length + 1).trim();
  if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
    return value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
  if (value.startsWith("'") && value.endsWith("'") && value.length > 1) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  return value;
}

function quote(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Bouwt de frontmatter van de vertaling: alles uit de bron, met de vertaalde
 * tekstvelden erin en `lang` op de doeltaal. `manual` staat op false; wie
 * daarna met de hand bijwerkt, zet hem zelf op true en is dan beschermd.
 */
function rewriteFront(lines, locale, translated) {
  const out = [];
  let sawLang = false;
  let sawManual = false;

  for (const line of lines) {
    if (line.startsWith('title:')) out.push(`title: ${quote(translated.title)}`);
    else if (line.startsWith('description:')) {
      out.push(`description: ${quote(translated.description)}`);
    } else if (line.startsWith('imageAlt:')) {
      out.push(`imageAlt: ${quote(translated.imageAlt ?? '')}`);
    } else if (line.startsWith('lang:')) {
      out.push(`lang: ${locale}`);
      sawLang = true;
    } else if (line.startsWith('manual:')) {
      out.push('manual: false');
      sawManual = true;
    } else {
      out.push(line);
    }
  }

  if (!sawLang) out.push(`lang: ${locale}`);
  if (!sawManual) out.push('manual: false');

  return out;
}

/* --- De API --- */

/**
 * De sleutel staat in .env naast package.json. Node leest dat bestand zelf;
 * er hoeft geen pakket voor geïnstalleerd te worden.
 */
function loadEnv() {
  try {
    process.loadEnvFile(path.resolve(process.cwd(), '.env'));
  } catch (error) {
    // Geen .env is prima zolang de sleutel al in de omgeving staat.
  }
}

const SYSTEM = `You translate posts for Megamundo, an independent fan site about the Grand Theft Auto games.

Rules:
- Translate into {LANGUAGE}. Return a natural, fluent translation, not a literal one.
- Keep the tone: helpful and clear, never slangy and never joking. Short paragraphs, scannable on a phone.
- Preserve the Markdown structure exactly: headings and their levels, lists and their markers, bold and italic, block quotes, tables, horizontal rules, line breaks and blank lines.
- Never translate the contents of code blocks or inline code, URLs, file names, or HTML attributes.
- Keep proper nouns in English: Grand Theft Auto, GTA, GTA Online, Rockstar Games, Take-Two, Vice City, Los Santos, Leonida, character names, mission names, vehicle names, weapon names, and in-game place names.
- Keep numbers, dates and units as they are, but use the punctuation and spacing that is normal in {LANGUAGE}.
- Do not add, remove, explain or summarise anything. Do not add a note about the translation.

Answer with exactly this shape and nothing else:

<title>the translated title</title>
<description>the translated description</description>
<image-alt>the translated image alt text, or empty if the input was empty</image-alt>
<body>
the translated Markdown body
</body>`;

function buildUserMessage(source) {
  return `<title>${source.title}</title>
<description>${source.description}</description>
<image-alt>${source.imageAlt ?? ''}</image-alt>
<body>
${source.body}
</body>`;
}

/** Haalt één blok uit het antwoord. */
function extract(text, tag) {
  const match = text.match(new RegExp(`<${tag}>\\r?\\n?([\\s\\S]*?)\\r?\\n?</${tag}>`));
  return match ? match[1] : undefined;
}

async function translate(client, source, locale) {
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 64000,
    system: SYSTEM.replaceAll('{LANGUAGE}', TARGETS[locale]),
    messages: [{ role: 'user', content: buildUserMessage(source) }],
  });

  const message = await stream.finalMessage();

  if (message.stop_reason === 'refusal') {
    throw new Error(`de API weigerde deze post (${message.stop_details?.category ?? 'onbekend'})`);
  }

  const text = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const title = extract(text, 'title');
  const description = extract(text, 'description');
  const body = extract(text, 'body');

  if (title === undefined || description === undefined || body === undefined) {
    throw new Error('het antwoord had niet de gevraagde vorm');
  }

  return {
    title: title.trim(),
    description: description.trim(),
    imageAlt: (extract(text, 'image-alt') ?? '').trim(),
    body,
  };
}

/* --- De lus --- */

const root = process.cwd();
const lockPath = path.join(root, LOCKFILE);

async function readLock() {
  try {
    return JSON.parse(await readFile(lockPath, 'utf8'));
  } catch (error) {
    return {};
  }
}

async function listSources(collection) {
  const dir = path.join(root, 'src/content', collection, 'en');
  try {
    const entries = await readdir(dir);
    return entries.filter((name) => name.endsWith('.md')).map((name) => name.slice(0, -3));
  } catch (error) {
    return [];
  }
}

/** Bestaat het bestand? */
async function exists(file) {
  try {
    await access(file);
    return true;
  } catch (error) {
    return false;
  }
}

loadEnv();

if (!args.dry && !process.env.ANTHROPIC_API_KEY) {
  console.error('Geen ANTHROPIC_API_KEY. Zet hem in .env naast package.json:');
  console.error('  ANTHROPIC_API_KEY=sk-ant-...');
  console.error('Die .env hoort niet in git.');
  process.exit(1);
}

const client = args.dry ? null : new Anthropic();
const lock = await readLock();

let done = 0;
let skipped = 0;
let failed = 0;

for (const collection of COLLECTIONS) {
  const slugs = await listSources(collection);

  for (const slug of slugs) {
    if (args.slug && slug !== args.slug) continue;

    const sourcePath = path.join(root, 'src/content', collection, 'en', `${slug}.md`);
    const raw = await readFile(sourcePath, 'utf8');
    const parsed = splitFile(raw);

    if (!parsed) {
      console.error(`! ${collection}/${slug}: geen frontmatter gevonden, overgeslagen`);
      failed += 1;
      continue;
    }

    const hash = createHash('sha256').update(raw).digest('hex');
    const key = `${collection}/${slug}`;
    const source = {
      title: readField(parsed.front, 'title') ?? '',
      description: readField(parsed.front, 'description') ?? '',
      imageAlt: readField(parsed.front, 'imageAlt') ?? '',
      body: parsed.body,
    };

    for (const locale of args.langs) {
      const targetDir = path.join(root, 'src/content', collection, locale);
      const targetPath = path.join(targetDir, `${slug}.md`);
      const label = `${collection}/${locale}/${slug}`;

      if (await exists(targetPath)) {
        const existing = await readFile(targetPath, 'utf8');
        const existingFront = splitFile(existing)?.front ?? [];

        // Regel 1: met de hand bijgewerkt betekent met rust laten.
        if (readField(existingFront, 'manual') === 'true') {
          console.log(`- ${label}: handmatig, blijft staan`);
          skipped += 1;
          continue;
        }

        // Regel 2: ongewijzigde bron betekent niets te doen.
        if (!args.force && lock[key]?.[locale] === hash) {
          skipped += 1;
          continue;
        }
      }

      if (args.dry) {
        console.log(`~ ${label}: zou vertaald worden`);
        continue;
      }

      try {
        const translated = await translate(client, source, locale);
        const front = rewriteFront(parsed.front, locale, translated);
        const output = `---\n${front.join('\n')}\n---\n\n${translated.body.trim()}\n`;

        await mkdir(targetDir, { recursive: true });
        await writeFile(targetPath, output, 'utf8');

        lock[key] = { ...(lock[key] ?? {}), [locale]: hash };
        // Na elke post wegschrijven: valt het script om, dan is het werk
        // dat al gedaan is niet weg.
        await writeFile(lockPath, `${JSON.stringify(lock, null, 2)}\n`, 'utf8');

        console.log(`+ ${label}`);
        done += 1;
      } catch (error) {
        console.error(`! ${label}: ${error.message}`);
        failed += 1;
      }
    }
  }
}

console.log(
  args.dry
    ? 'Proefdraai, er is niets geschreven.'
    : `Klaar: ${done} vertaald, ${skipped} overgeslagen, ${failed} mislukt.`,
);

if (failed > 0) process.exitCode = 1;
