/*
 * Filteren, zoeken en bijladen van een pillijst. Alles gebeurt op de pillen
 * die er al staan; er wordt niets opgehaald en niets herladen.
 *
 * Gedeeld door PostList (de homepage) en FeedList (Daily Clips en Streams);
 * beide zetten dezelfde data-attributen neer. Op de feedpagina's staan geen
 * categoriechips, dus daar valt het filter vanzelf weg.
 *
 * De staat:
 *   category — in de URL (?cat=), deelbaar en terug-knop-vriendelijk
 *   query    — alleen in het geheugen, zoals de handoff voorschrijft
 *   visible  — hoeveel pillen er getoond zijn; groeit per LOAD MORE
 */
const list = document.querySelector<HTMLElement>('[data-mm-list]');
const items = list?.querySelector<HTMLElement>('[data-mm-items]');

if (list && items) {
  const step = Number(list.dataset.step ?? '15');
  const pills = Array.from(items.querySelectorAll<HTMLElement>('[data-mm-post]'));
  const more = list.querySelector<HTMLButtonElement>('[data-mm-more]');
  const noResults = list.querySelector<HTMLElement>('[data-mm-noresults]');
  const chips = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('[data-mm-filter] [data-cat]'),
  );
  const searchInputs = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[name="q"]'),
  );
  const sentinel = list.querySelector<HTMLElement>('[data-mm-sentinel]');

  const params = new URLSearchParams(window.location.search);
  const known = new Set(chips.map((chip) => chip.dataset.cat));

  let category = params.get('cat') ?? 'all';
  if (!known.has(category)) category = 'all';

  let query = (params.get('q') ?? '').trim().toLowerCase();
  let visible = step;

  /** Welke pillen door het filter en de zoekterm komen, in volgorde. */
  const matching = () =>
    pills.filter((pill) => {
      const inCategory = category === 'all' || pill.dataset.category === category;
      const inQuery = !query || (pill.dataset.title ?? '').includes(query);
      return inCategory && inQuery;
    });

  const render = (markNew = false) => {
    const shown = matching();
    const cutoff = Math.min(visible, shown.length);
    const visibleSet = new Set(shown.slice(0, cutoff));

    pills.forEach((pill) => {
      const show = visibleSet.has(pill);
      // Was hij verborgen en komt hij er nu bij, dan mag hij binnenkomen.
      if (show && markNew && pill.hidden) pill.classList.add('is-new');
      else if (!show) pill.classList.remove('is-new');
      pill.hidden = !show;
    });

    const done = cutoff >= shown.length;
    if (more) more.hidden = done;
    if (sentinel) sentinel.hidden = done;
    if (noResults) noResults.hidden = shown.length > 0;

    return shown.slice(0, cutoff);
  };

  /** De URL bijwerken zonder de pagina aan te raken. */
  const syncUrl = () => {
    const next = new URLSearchParams(window.location.search);
    if (category === 'all') next.delete('cat');
    else next.set('cat', category);

    const search = next.toString();
    const url = `${window.location.pathname}${search ? `?${search}` : ''}`;
    window.history.replaceState({}, '', url);
  };

  const syncChips = () => {
    chips.forEach((chip) => {
      if (chip.dataset.cat === category) chip.setAttribute('aria-current', 'true');
      else chip.removeAttribute('aria-current');
    });
  };

  chips.forEach((chip) => {
    chip.addEventListener('click', (event) => {
      event.preventDefault();
      category = chip.dataset.cat ?? 'all';
      // Een andere categorie begint weer bovenaan de lijst.
      visible = step;
      syncChips();
      syncUrl();
      render();
    });
  });

  searchInputs.forEach((input) => {
    // Stond er een ?q= in de URL, dan staat die term ook in het veld.
    if (query && !input.value) input.value = query;

    input.addEventListener('input', () => {
      query = input.value.trim().toLowerCase();
      visible = step;
      // Twee velden (koptekst en mobiel menu) blijven gelijk.
      searchInputs.forEach((other) => {
        if (other !== input) other.value = input.value;
      });
      render();
    });

    // Met JavaScript hoeft het formulier nergens heen; er is al gefilterd.
    input.form?.addEventListener('submit', (event) => event.preventDefault());
  });

  more?.addEventListener('click', () => {
    visible += step;
    const shown = render(true);
    // De focus naar de eerste nieuwe pil, anders staat hij op een knop
    // die misschien net verdwenen is.
    const first = shown.find((pill) => pill.classList.contains('is-new'));
    first?.querySelector<HTMLAnchorElement>('a')?.focus();
  });

  syncChips();
  render();

  /*
   * Vanzelf bijladen. Zodra het baken onder de lijst in de buurt van de
   * onderrand komt, komt de volgende reeks erbij.
   *
   * Bewust met een scroll-luisteraar en niet met een IntersectionObserver.
   * Die laatste meldde het baken één keer als "niet in beeld" en daarna
   * nooit meer, omdat het element nul pixels hoog was. Een hoogte van één
   * pixel lost dat op, maar een simpele meting van de afstand tot de
   * onderrand is voorspelbaar en heeft die valkuil niet.
   *
   * De lus laadt door tot het baken weer ver genoeg weg is. Dat is nodig
   * na filteren of zoeken: dan staat de lijst weer op de eerste reeks en
   * kan het baken meteen weer binnen bereik liggen.
   */
  const maybeLoad = () => {
    if (!sentinel) return;
    // Hoogstens een paar reeksen per keer, zodat een fout hier nooit een
    // eindeloze lus wordt.
    for (let i = 0; i < 5; i += 1) {
      if (sentinel.hidden) return;
      if (sentinel.getBoundingClientRect().top > window.innerHeight + 600) return;
      visible += step;
      render(true);
    }
  };

  let wachtend = false;
  const onScroll = () => {
    if (wachtend) return;
    wachtend = true;
    requestAnimationFrame(() => {
      wachtend = false;
      maybeLoad();
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  maybeLoad();
}
