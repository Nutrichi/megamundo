/*
 * Zoeken over de hele site met Pagefind (§15, fase 5). Pagefind maakt bij
 * `npm run build` een statische index van elke post en elk gebied, per taal,
 * en zoekt daarin in de browser. Geen server, geen dienst van derden.
 *
 * Hetzelfde veld doet twee dingen (§5.3):
 * - op een pagina met een pillijst (homepage, Daily Clips, Streams) filtert
 *   het die lijst live, zoals altijd, en toont Enter daarbovenop wat er op
 *   de hele site gevonden is;
 * - op elke andere pagina verschijnen de resultaten al tijdens het typen.
 *
 * De index bestaat pas na een build. In `npm run dev` is er geen, en dan
 * valt Enter terug op wat het veld zonder JavaScript doet: de homepage met
 * `?q=`. Pagefind kiest zelf de index in de taal van de pagina, uit het
 * lang-attribuut van <html>.
 */

type PagefindData = { url: string; excerpt: string; meta: { title?: string } };
type Pagefind = {
  init?: () => Promise<void>;
  search: (query: string) => Promise<{ results: Array<{ data: () => Promise<PagefindData> }> } | null>;
};

/** Hoeveel resultaten het paneel toont. Genoeg om te kiezen, niet om te scrollen. */
const MAX = 6;

let loading: Promise<Pagefind | null> | null = null;
const loadPagefind = () => {
  if (!loading) {
    /*
     * De import zelf staat in een is:inline-script in SearchField.astro, buiten
     * Vite om; zie de uitleg daar. De Promise vangt ook een fout die meteen
     * optreedt, zodat een ontbrekende index nooit een uitzondering wordt.
     */
    const loader = (window as Window & { mmLoadPagefind?: () => Promise<Pagefind> }).mmLoadPagefind;
    loading = new Promise<Pagefind>((resolve, reject) => {
      if (!loader) reject(new Error('Geen Pagefind-lader'));
      else resolve(loader());
    })
      .then(async (module) => {
        await module.init?.();
        return module;
      })
      .catch(() => null);
  }
  return loading;
};

const hasList = document.querySelector('[data-mm-list]') !== null;

document.querySelectorAll<HTMLElement>('[data-mm-search]').forEach((box) => {
  const input = box.querySelector<HTMLInputElement>('input[name="q"]');
  const form = input?.form;
  const panel = box.querySelector<HTMLElement>('[data-mm-results]');
  const list = box.querySelector<HTMLElement>('[data-mm-results-list]');
  const status = box.querySelector<HTMLElement>('[data-mm-results-status]');
  if (!input || !form || !panel || !list || !status) return;

  let run = 0;
  const close = () => {
    run += 1;
    panel.hidden = true;
  };

  const links = () => Array.from(list.querySelectorAll<HTMLAnchorElement>('a'));

  const show = async (query: string, pagefind: Pagefind) => {
    const current = ++run;
    const q = query.trim();
    if (q.length < 2) {
      close();
      return;
    }

    const search = await pagefind.search(q);
    if (!search || current !== run) return;
    const found = await Promise.all(search.results.slice(0, MAX).map((result) => result.data()));
    // Intussen verder getypt: dan is dit antwoord al oud.
    if (current !== run) return;

    list.replaceChildren(
      ...found.map((item) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'mm-results__item';
        link.href = item.url;
        const title = document.createElement('span');
        title.className = 'mm-results__title';
        title.textContent = item.meta.title ?? item.url;
        const excerpt = document.createElement('span');
        excerpt.className = 'mm-results__excerpt';
        // Pagefind geeft de tekst van onze eigen pagina's terug, ontsnapt, met
        // <mark> rond de treffers.
        excerpt.innerHTML = item.excerpt;
        link.append(title, excerpt);
        li.append(link);
        return li;
      }),
    );

    const total = search.results.length;
    status.textContent =
      total === 0
        ? (box.dataset.labelNone ?? '')
        : total === 1
          ? (box.dataset.labelOne ?? '')
          : (box.dataset.labelMany ?? '').replace('{n}', String(total));
    panel.hidden = false;
  };

  input.addEventListener('input', async () => {
    // Op een pagina met een lijst filtert die lijst al; het paneel komt pas bij Enter.
    if (hasList) {
      close();
      return;
    }
    const pagefind = await loadPagefind();
    if (pagefind) void show(input.value, pagefind);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const pagefind = await loadPagefind();
    // Geen index (npm run dev): doen wat het formulier zonder JavaScript doet.
    if (!pagefind) {
      if (!hasList) form.submit();
      return;
    }
    void show(input.value, pagefind);
  });

  // Pijltjes van het veld naar de resultaten en terug; Escape sluit.
  box.addEventListener('keydown', (event) => {
    if (panel.hidden) return;
    const items = links();
    const index = items.indexOf(document.activeElement as HTMLAnchorElement);

    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      input.focus();
    } else if (event.key === 'ArrowDown' && items.length) {
      event.preventDefault();
      items[Math.min(index + 1, items.length - 1)].focus();
    } else if (event.key === 'ArrowUp' && index >= 0) {
      event.preventDefault();
      if (index === 0) input.focus();
      else items[index - 1].focus();
    }
  });

  // Klikt of tabt de bezoeker ergens anders heen, dan gaat het paneel dicht.
  box.addEventListener('focusout', (event) => {
    if (!box.contains(event.relatedTarget as Node | null)) close();
  });
});
