/*
 * Praten met Supabase, zonder bibliotheek.
 *
 * De officiële client is ongeveer dertig kilobyte voor drie verzoeken.
 * §3 zegt: geen framework tenzij een widget het echt nodig heeft, liever
 * vanilla JS in kleine eilandjes. Dit is zo'n eilandje.
 *
 * Elke functie hier faalt zacht. Een fout wordt gemeld aan de aanroeper en
 * gooit nooit iets omhoog waar de pagina van omvalt (§8.2).
 */

import { identityKey, supabaseKey, supabaseUrl } from '../config/supabase';

const headers = {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
};

/**
 * Het ID dat deze browser identificeert. Willekeurig, lokaal gemaakt, en
 * verder nergens aan gekoppeld: geen account, geen e-mail, geen naam (§8.3).
 *
 * Wist iemand zijn browsergegevens, dan is hij een nieuwe bezoeker en kan hij
 * opnieuw liken. Dat is het aanvaarde nadeel van geen accounts hebben.
 */
export function identity(): string | null {
  try {
    let id = localStorage.getItem(identityKey);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(identityKey, id);
    }
    return id;
  } catch (error) {
    // Privémodus of geblokkeerde opslag: dan kan deze bezoeker niet liken.
    return null;
  }
}

/** De tellingen van een reeks posts, in één verzoek. */
export async function likeCounts(postIds: string[]): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};

  // PostgREST wil de lijst tussen haakjes, en een post-id kan een schuine
  // streep bevatten, dus elk item tussen aanhalingstekens.
  const list = postIds.map((id) => `"${id.replace(/"/g, '')}"`).join(',');
  const url = `${supabaseUrl}/rest/v1/post_stats?select=post_id,like_count&post_id=in.(${encodeURIComponent(list)})`;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) return {};
    const rows: { post_id: string; like_count: number }[] = await response.json();
    return Object.fromEntries(rows.map((row) => [row.post_id, row.like_count]));
  } catch (error) {
    return {};
  }
}

/**
 * Een like plaatsen. Geeft de nieuwe telling terug, of null als het niet
 * gelukt is. Twee keer liken is geen fout: de database houdt het op één en
 * geeft gewoon de huidige telling terug.
 */
export async function addLike(postId: string): Promise<number | null> {
  const id = identity();
  if (!id) return null;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/add_like`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ p_post_id: postId, p_identity: id }),
    });
    if (!response.ok) return null;
    const count = await response.json();
    return typeof count === 'number' ? count : null;
  } catch (error) {
    return null;
  }
}

/** Wat er terugkomt uit het inzendformulier. */
export type SubmitResult = { ok: true } | { ok: false; reason: 'storage' | 'network' };

/** Een tip insturen (§5.3). De drempels tegen bots staan in de database. */
export async function submitNews(fields: {
  title: string;
  sourceUrl: string;
  note: string;
  nickname: string;
}): Promise<SubmitResult> {
  const id = identity();
  if (!id) return { ok: false, reason: 'storage' };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_news`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        p_title: fields.title,
        p_source_url: fields.sourceUrl,
        p_note: fields.note,
        p_nickname: fields.nickname,
        p_identity: id,
      }),
    });
    return response.ok ? { ok: true } : { ok: false, reason: 'network' };
  } catch (error) {
    return { ok: false, reason: 'network' };
  }
}
