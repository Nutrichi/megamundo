#!/usr/bin/env node
/*
 * fetch-feeds.mjs — haalt de inhoud van Daily Clips en Streams op
 * (PROJECT_SPEC.md §10).
 *
 * Er wordt niets gecommit (afspraak 11 september 2026). Het script schrijft
 * naar src/data/generated/, dat niet in git staat, en draait vlak voor de
 * build: in de GitHub Action bij elke gebouwde versie, lokaal met
 * `npm run feeds`. De Action bewaart die map tussen twee runs in zijn cache,
 * zodat YouTube niet bij elke build opnieuw gevraagd wordt.
 *
 * Gebruik:
 *   npm run feeds                Twitch altijd, YouTube zodra de clips ouder zijn dan 55 minuten
 *   npm run feeds -- --force     YouTube ook als de clips nog vers zijn
 *   npm run feeds -- --sample    verzonnen voorbeelddata, zonder sleutels
 *
 * De sleutels komen uit .env naast package.json, of uit de omgeving:
 *   TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY
 * In de Action zijn het repo secrets. Nooit in de browser (§10.1).
 *
 * Faalt een bron, dan blijft het vorige bestand staan en eindigt het script
 * toch netjes. Een haperende API mag de build niet breken; de pagina toont
 * dan een oudere momentopname, en de tijd bovenaan zegt hoe oud die is. Is
 * er nog nooit iets opgehaald, dan is er geen bestand, geen pagina en geen
 * tab (§4.1).
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'src/data/generated');
const FEATURED_FILE = path.join(ROOT, 'src/data/featured.json');
const BLOCKLIST_FILE = path.join(ROOT, 'src/data/blocklist.json');

/*
 * De regels (§10.3). Het script schrijft ze mee in het bestand en de pagina
 * toont ze van daaruit: wat de lijstkop belooft, is wat er gefilterd is.
 */
const TWITCH = {
  /** Grand Theft Auto V. Na de release wordt dit de categorie van GTA VI. */
  gameId: '32982',
  game: 'Grand Theft Auto V',
  /** Was 500, daarna 200; op 11 september naar 50 gezet door Nutri. */
  minViewers: 50,
  /** "Alles boven de drempel": vijf pagina's van Twitch, hoogstens 500 streams. */
  max: 500,
};

const YOUTUBE = {
  query: 'GTA Online',
  windowHours: 24,
  /** Was 1000; op 11 september naar 250 gezet door Nutri. */
  minViews: 250,
  /** YouTube noemt korter dan vier minuten `short`; dat is precies de regel. */
  duration: 'short',
  /** Korter dan dit is geen clip (Nutri, 11 september 2026). */
  minSeconds: 10,
  maxSeconds: 240,
  language: 'en',
  max: 50,
  /*
   * Eén zoekopdracht kost 100 van de 10.000 gratis eenheden per dag. Elk uur
   * is dat 2.400; bij elke build van een kwartier zou het 9.600 zijn, en dat
   * is te krap. Daarom alleen als de vorige clips ouder zijn dan dit.
   */
  refreshMinutes: 55,
};

const args = new Set(process.argv.slice(2));
const SAMPLE = args.has('--sample');
const FORCE = args.has('--force');

/** In een Action wordt een waarschuwing een gele melding bij de run. */
function warn(message) {
  console.warn(process.env.GITHUB_ACTIONS ? `::warning::${message}` : `  ${message}`);
}

function loadEnv() {
  try {
    process.loadEnvFile(path.join(ROOT, '.env'));
  } catch {
    // Geen .env is prima zolang de sleutels al in de omgeving staan.
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

/** Eerst naar een tijdelijk bestand, dan hernoemen: nooit een half bestand. */
function writeFeed(name, data) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `${name}.json`);
  fs.writeFileSync(`${file}.tmp`, `${JSON.stringify(data, null, 2)}\n`);
  fs.renameSync(`${file}.tmp`, file);
  console.log(`  ${name}: ${data.items.length} in de lijst, ${data.featured.length} uitgelicht`);
}

/*
 * Nooit de volledige URL in een foutmelding: bij YouTube staat de sleutel
 * erin, en de log van een Action op een publiek repo is openbaar.
 */
async function getJson(url, init = {}) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) {
    const { host, pathname } = new URL(url);
    throw new Error(`${response.status} ${response.statusText} op ${host}${pathname}`);
  }
  return response.json();
}

const chunk = (list, size) =>
  Array.from({ length: Math.ceil(list.length / size) }, (_, i) => list.slice(i * size, (i + 1) * size));

/* --- Twitch ------------------------------------------------------------- */

async function twitchToken(clientId, clientSecret) {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${response.status} bij het aanvragen van een Twitch-token`);
  return (await response.json()).access_token;
}

function toStream(stream) {
  return {
    channel: stream.user_login,
    name: stream.user_name,
    title: stream.title.trim(),
    game: stream.game_name,
    viewers: stream.viewer_count,
    startedAt: stream.started_at,
    language: stream.language,
    thumbnail: stream.thumbnail_url
      ? stream.thumbnail_url.replace('{width}', '640').replace('{height}', '360')
      : null,
    url: `https://www.twitch.tv/${stream.user_login}`,
    live: true,
  };
}

async function fetchStreams(picks) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    warn('streams: geen TWITCH_CLIENT_ID of TWITCH_CLIENT_SECRET, overgeslagen');
    return;
  }

  const token = await twitchToken(clientId, clientSecret);
  const headers = { 'Client-Id': clientId, Authorization: `Bearer ${token}` };

  const seen = new Set();
  const items = [];
  let cursor;

  for (let page = 0; page < 5; page += 1) {
    const query = new URLSearchParams({ game_id: TWITCH.gameId, type: 'live', first: '100' });
    if (cursor) query.set('after', cursor);
    const { data, pagination } = await getJson(`https://api.twitch.tv/helix/streams?${query}`, { headers });

    for (const stream of data) {
      if (stream.viewer_count < TWITCH.minViewers || seen.has(stream.user_id)) continue;
      seen.add(stream.user_id);
      items.push(toStream(stream));
    }

    // Twitch sorteert op kijkers: onder de drempel komt er niets meer bij.
    const last = data.at(-1);
    cursor = pagination?.cursor;
    if (!cursor || !last || last.viewer_count < TWITCH.minViewers || items.length >= TWITCH.max) break;
  }

  items.sort((a, b) => b.viewers - a.viewers);

  // De uitgelichte kanalen, live of niet. Offline tonen we ze als offline (§10.4).
  const logins = [...new Set(picks.map((pick) => String(pick.channel ?? '').toLowerCase()).filter(Boolean))];
  const featured = [];

  for (const group of chunk(logins, 100)) {
    const streamQuery = group.map((login) => `user_login=${encodeURIComponent(login)}`).join('&');
    const userQuery = group.map((login) => `login=${encodeURIComponent(login)}`).join('&');
    const [{ data: live }, { data: users }] = await Promise.all([
      getJson(`https://api.twitch.tv/helix/streams?${streamQuery}`, { headers }),
      getJson(`https://api.twitch.tv/helix/users?${userQuery}`, { headers }),
    ]);

    for (const user of users) {
      const stream = live.find((candidate) => candidate.user_id === user.id);
      featured.push(stream ? toStream(stream) : {
        channel: user.login,
        name: user.display_name,
        title: '',
        game: '',
        viewers: 0,
        startedAt: null,
        language: '',
        thumbnail: user.offline_image_url || user.profile_image_url || null,
        url: `https://www.twitch.tv/${user.login}`,
        live: false,
      });
    }
  }

  writeFeed('streams', {
    fetchedAt: new Date().toISOString(),
    rules: { game: TWITCH.game, minViewers: TWITCH.minViewers },
    items: items.slice(0, TWITCH.max),
    featured,
  });
}

/* --- YouTube ------------------------------------------------------------ */

/** "PT3M24S" wordt 204. */
function seconds(iso) {
  const match = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso ?? '');
  if (!match) return 0;
  const [days, hours, minutes, secs] = match.slice(1).map((value) => Number(value ?? 0));
  return days * 86_400 + hours * 3_600 + minutes * 60 + secs;
}

function toClip(video) {
  const thumbs = video.snippet.thumbnails ?? {};
  return {
    id: video.id,
    title: video.snippet.title.trim(),
    channel: video.snippet.channelTitle,
    channelId: video.snippet.channelId,
    views: Number(video.statistics?.viewCount ?? 0),
    publishedAt: video.snippet.publishedAt,
    duration: seconds(video.contentDetails?.duration),
    language: video.snippet.defaultAudioLanguage ?? video.snippet.defaultLanguage ?? '',
    /*
     * 640 bij 480 en niet de grootste (1280 bij 720): het grote blok is
     * hoogstens 562 pixels breed, en de zware versie maakte het grootste beeld
     * van Daily Clips op een telefoon 3,8 seconden traag (Lighthouse, 11 september).
     */
    thumbnail: (thumbs.standard ?? thumbs.high ?? thumbs.medium ?? thumbs.maxres)?.url ?? null,
    url: `https://www.youtube.com/watch?v=${video.id}`,
  };
}

async function fetchClips(picks) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    warn('clips: geen YOUTUBE_API_KEY, overgeslagen');
    return;
  }

  const featuredIds = [...new Set(picks.map((pick) => String(pick.video ?? '')).filter(Boolean))];
  const previous = readJson(path.join(OUT_DIR, 'clips.json'), null);
  const ageMinutes = previous ? (Date.now() - Date.parse(previous.fetchedAt)) / 60_000 : Infinity;
  // Een nieuwe keuze in featured.json wacht niet op het volgende uur.
  const samePicks = JSON.stringify(previous?.featuredIds ?? []) === JSON.stringify(featuredIds);

  if (!FORCE && samePicks && ageMinutes < YOUTUBE.refreshMinutes) {
    console.log(`  clips: ${Math.round(ageMinutes)} minuten oud, nog vers genoeg`);
    return;
  }

  const blocklist = readJson(BLOCKLIST_FILE, {});
  const blocked = new Set(blocklist.youtubeChannels ?? []);
  // Woorden in een titel die op lokaas wijzen, zoals een mod menu om te downloaden.
  const blockedTerms = (blocklist.titleTerms ?? []).map((term) => term.toLowerCase());

  const searchQuery = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: YOUTUBE.query,
    order: 'viewCount',
    publishedAfter: new Date(Date.now() - YOUTUBE.windowHours * 3_600_000).toISOString(),
    videoDuration: YOUTUBE.duration,
    relevanceLanguage: YOUTUBE.language,
    maxResults: String(YOUTUBE.max),
    key,
  });
  const search = await getJson(`https://www.googleapis.com/youtube/v3/search?${searchQuery}`);
  const found = search.items.map((item) => item.id?.videoId).filter(Boolean);

  // De details van alles samen: één eenheid per vijftig video's.
  const videos = [];
  for (const group of chunk([...new Set([...found, ...featuredIds])], 50)) {
    const query = new URLSearchParams({ part: 'snippet,contentDetails,statistics', id: group.join(','), key });
    videos.push(...(await getJson(`https://www.googleapis.com/youtube/v3/videos?${query}`)).items);
  }
  const byId = new Map(videos.map((video) => [video.id, video]));

  const items = found
    .map((id) => byId.get(id))
    .filter((video) => video && video.snippet.liveBroadcastContent === 'none')
    .map(toClip)
    .filter((clip) =>
      clip.views >= YOUTUBE.minViews
      && clip.duration >= YOUTUBE.minSeconds
      && clip.duration <= YOUTUBE.maxSeconds
      && !blocked.has(clip.channelId)
      && !blockedTerms.some((term) => clip.title.toLowerCase().includes(term))
      // Noemt de video zelf een taal, dan moet het die zijn. Noemt hij niets,
      // dan heeft relevanceLanguage de keuze al gemaakt.
      && (!clip.language || clip.language.toLowerCase().startsWith(YOUTUBE.language)))
    // Op datum, nieuwste eerst (§10.3).
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  writeFeed('clips', {
    fetchedAt: new Date().toISOString(),
    rules: {
      query: YOUTUBE.query,
      windowHours: YOUTUBE.windowHours,
      minViews: YOUTUBE.minViews,
      minSeconds: YOUTUBE.minSeconds,
      maxMinutes: YOUTUBE.maxSeconds / 60,
      language: YOUTUBE.language,
    },
    featuredIds,
    items,
    featured: featuredIds.map((id) => byId.get(id)).filter(Boolean).map(toClip),
  });
}

/* --- Voorbeelddata ------------------------------------------------------ */

/*
 * Om de pagina's te bouwen en te bekijken zonder sleutels. Alles is
 * verzonnen: geen echte kanalen, geen echte video's, geen beelden. Draai
 * daarna `npm run feeds` met sleutels om het te vervangen.
 */
function writeSample() {
  const now = Date.now();
  const topics = ['Heist night', 'Car meet', 'Drift tuning', 'Roleplay city', 'Business rivalries', 'Stunt races'];
  const languages = ['en', 'de', 'fr', 'es', 'pt', 'nl'];

  writeFeed('streams', {
    fetchedAt: new Date(now).toISOString(),
    sample: true,
    rules: { game: TWITCH.game, minViewers: TWITCH.minViewers },
    items: Array.from({ length: 24 }, (_, i) => ({
      channel: `sample_channel_${i + 1}`,
      name: `SampleChannel${i + 1}`,
      title: `${topics[i % topics.length]} with the crew, part ${i + 1}`,
      game: TWITCH.game,
      viewers: Math.round(24_000 / (i + 1)) + TWITCH.minViewers,
      startedAt: new Date(now - (i + 1) * 23 * 60_000).toISOString(),
      language: languages[i % languages.length],
      thumbnail: null,
      url: 'https://www.twitch.tv/',
      live: true,
    })),
    featured: [],
  });

  writeFeed('clips', {
    fetchedAt: new Date(now).toISOString(),
    sample: true,
    rules: {
      query: YOUTUBE.query,
      windowHours: YOUTUBE.windowHours,
      minViews: YOUTUBE.minViews,
      minSeconds: YOUTUBE.minSeconds,
      maxMinutes: YOUTUBE.maxSeconds / 60,
      language: YOUTUBE.language,
    },
    featuredIds: [],
    items: Array.from({ length: 30 }, (_, i) => ({
      id: `sample${i + 1}`,
      title: `${topics[i % topics.length]}: sample clip ${i + 1}`,
      channel: `Sample Maker ${(i % 7) + 1}`,
      channelId: `sample-${i % 7}`,
      views: Math.round(90_000 / (i + 1)) + YOUTUBE.minViews,
      publishedAt: new Date(now - (i + 1) * 45 * 60_000).toISOString(),
      duration: 45 + ((i * 37) % 190),
      language: 'en',
      thumbnail: null,
      url: 'https://www.youtube.com/',
    })),
    featured: [],
  });
}

/* --- Draaien ------------------------------------------------------------ */

loadEnv();
console.log(SAMPLE ? 'Voorbeelddata schrijven' : 'Feeds ophalen');

if (SAMPLE) {
  writeSample();
} else {
  const picks = readJson(FEATURED_FILE, { streams: [], clips: [] });
  const jobs = [
    ['streams', () => fetchStreams(picks.streams ?? [])],
    ['clips', () => fetchClips(picks.clips ?? [])],
  ];

  for (const [name, run] of jobs) {
    try {
      await run();
    } catch (error) {
      warn(`${name}: ophalen mislukt, het vorige bestand blijft staan (${error.message})`);
    }
  }
}
