/*
 * Afspelen op de pagina zelf (Nutri, 11 september 2026). Een klik op een clip
 * of een stream speelt die in het grote blok links, op een telefoon bovenaan.
 * Geen popup, en niet weg van de site.
 *
 * Er laadt niets van YouTube of Twitch voor iemand klikt: het iframe komt er
 * pas bij de klik in. Zonder JavaScript blijft elke link gewoon een link naar
 * de bron.
 *
 * Twitch eist voor zijn speler minstens 400 bij 300 pixels, https, en de
 * domeinnaam als `parent`. Is het blok smaller dan 400 pixels, dan doet een
 * stream wat hij altijd deed: Twitch openen in een nieuw tabblad.
 */

/*
 * Bekeken clips (Nutri, 11 september 2026). Een clip die je al eens gestart
 * hebt, krijgt een vinkje in plaats van het driehoekje. Dat staat alleen in
 * deze browser, in localStorage. Een clip is na een dag toch uit de lijst;
 * na een week ruimt het script hem op.
 */
const WATCHED_KEY = 'mm-watched';
const WEEK = 7 * 24 * 3_600_000;

const readWatched = (): Record<string, number> => {
  try {
    const raw = JSON.parse(localStorage.getItem(WATCHED_KEY) ?? '{}') as Record<string, number>;
    const now = Date.now();
    return Object.fromEntries(Object.entries(raw).filter(([, at]) => now - at < WEEK));
  } catch {
    return {};
  }
};

const paintWatched = () => {
  const watched = readWatched();
  document.querySelectorAll<HTMLElement>('[data-mm-clip-id]').forEach((el) => {
    el.classList.toggle('is-watched', (el.dataset.mmClipId ?? '') in watched);
  });
};

const markWatched = (id: string) => {
  const watched = readWatched();
  watched[id] = Date.now();
  try {
    localStorage.setItem(WATCHED_KEY, JSON.stringify(watched));
  } catch {
    // Privémodus: deze browser onthoudt het dan niet, maar deze pagina toont het wel.
  }
  document
    .querySelectorAll<HTMLElement>(`[data-mm-clip-id="${CSS.escape(id)}"]`)
    .forEach((el) => el.classList.add('is-watched'));
};

/* Elke manier van openen telt: hier afspelen, Cmd-klik, middelste muisknop. */
const watchedFrom = (event: MouseEvent) => {
  if (!(event.target instanceof Element)) return;
  const link = event.target.closest<HTMLAnchorElement>('a[data-mm-play="clip"]');
  if (link?.dataset.id) markWatched(link.dataset.id);
};

document.addEventListener('click', watchedFrom);
document.addEventListener('auxclick', (event) => {
  if (event.button === 1) watchedFrom(event);
});
paintWatched();
// Terug uit de bfcache, of in een ander tabblad bekeken: opnieuw kijken.
window.addEventListener('pageshow', paintWatched);

const lead = document.querySelector<HTMLElement>('[data-mm-stage]');
const box = lead?.querySelector<HTMLElement>('[data-mm-stage-box]');

if (lead && box) {
  const titleLink = lead.querySelector<HTMLAnchorElement>('[data-mm-stage-title]');
  const meta = lead.querySelector<HTMLElement>('[data-mm-stage-meta]');
  const pick = lead.querySelector<HTMLElement>('[data-mm-stage-pick]');
  const leadId = lead.dataset.id ?? '';
  const leadPicked = lead.classList.contains('is-picked');

  /** De officiële spelers: YouTube in de privacyvriendelijke variant, en Twitch. */
  const embedUrl = (kind: string, id: string) =>
    kind === 'clip'
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`
      : `https://player.twitch.tv/?${new URLSearchParams({
          channel: id,
          parent: window.location.hostname,
          autoplay: 'true',
          muted: 'false',
        })}`;

  /** Het blok in beeld brengen, onder de vastgepinde koptekst. */
  const reveal = () => {
    const offset = (document.querySelector<HTMLElement>('.mm-top')?.offsetHeight ?? 0) + 12;
    const top = lead.getBoundingClientRect().top;
    if (top >= offset && top < window.innerHeight / 2) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: top + window.scrollY - offset, behavior: smooth ? 'smooth' : 'auto' });
  };

  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>('a[data-mm-play]');
    if (!link) return;
    // Cmd- of Ctrl-klik opent de bron in een nieuw tabblad, zoals elke link.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const kind = link.dataset.mmPlay ?? '';
    const id = link.dataset.id ?? '';
    if (!id) return;
    // Te smal voor de Twitch-speler: dan gewoon naar Twitch.
    if (kind === 'stream' && box.getBoundingClientRect().width < 400) return;

    event.preventDefault();

    const iframe = document.createElement('iframe');
    iframe.src = embedUrl(kind, id);
    iframe.title = link.dataset.title ?? '';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    // YouTube weigert een embed die niet zegt van welke site hij komt.
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    lead.classList.add('is-playing');
    box.replaceChildren(iframe);

    // De titel en de metaregel volgen wat er speelt. De titel wordt nu een
    // link naar de bron, want afspelen doet hij al.
    if (titleLink) {
      titleLink.textContent = link.dataset.title ?? '';
      titleLink.href = link.href;
      titleLink.removeAttribute('data-mm-play');
      titleLink.target = '_blank';
      titleLink.rel = 'noopener';
    }
    if (meta) meta.textContent = link.dataset.meta ?? '';

    // Het gele label en de gele rand horen alleen bij het uitgelichte item zelf.
    const isLead = id === leadId;
    if (pick) pick.hidden = !isLead;
    lead.classList.toggle('is-picked', isLead && leadPicked);

    document
      .querySelectorAll('[data-mm-post].is-playing')
      .forEach((pill) => pill.classList.remove('is-playing'));
    link.closest('[data-mm-post]')?.classList.add('is-playing');

    reveal();
  });
}
