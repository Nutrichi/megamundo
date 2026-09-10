/*
 * Alle UI-teksten, per taal. Nooit een label hard in een template
 * (PROJECT_SPEC.md §11). Content zelf blijft Engels; dit gaat alleen over
 * de interface.
 *
 * Zes talen, bevestigd 9 september 2026. Engels is de brontaal en de
 * terugval: ontbreekt een sleutel in een taal, dan komt de Engelse tekst.
 */

export const locales = ['en', 'nl', 'fr', 'es', 'it', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** Wat er in de taalkiezer staat. Elke taal noemt zichzelf in eigen taal. */
export const localeNames: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  de: 'Deutsch',
};

/** Wat er in het kleine vakje staat: twee letters, zoals het ontwerp tekent. */
export const localeShort: Record<Locale, string> = {
  en: 'EN', nl: 'NL', fr: 'FR', es: 'ES', it: 'IT', de: 'DE',
};

/** Voor de datumopmaak en het lang-attribuut. */
export const localeTags: Record<Locale, string> = {
  en: 'en', nl: 'nl', fr: 'fr', es: 'es', it: 'it', de: 'de',
};

export const ui = {
  en: {
    'site.title': 'Megamundo',
    'site.description': 'An independent GTA fansite counting down to Grand Theft Auto VI.',
    'site.tagline': 'An independent fansite for Grand Theft Auto, counting down to GTA VI.',
    'site.disclaimer':
      'Megamundo is an independent fansite. Not affiliated with, endorsed by or associated with Rockstar Games or Take-Two Interactive. All trademarks belong to their respective owners.',

    'skip.content': 'Skip to content',

    'nav.label': 'Main navigation',
    'nav.home': 'Home',
    'nav.game': 'Game',
    'nav.guides': 'Guides',
    'nav.clips': 'Daily Clips',
    'nav.streams': 'Streams',
    'nav.map': 'Map',
    'nav.open': 'Open menu',
    'nav.close': 'Close menu',

    'search.placeholder': 'Search',
    'search.label': 'Search posts by title',

    'lang.label': 'Language',
    'theme.label': 'Theme',
    'theme.night': 'Night',
    'theme.day': 'Day',
    'theme.toggle': 'Switch between the night and day theme',

    'countdown.label': 'GTA VI — 19.11.2026',
    'countdown.suffix': 'UNTIL GTA VI',
    'countdown.days': 'D',
    'countdown.hours': 'H',
    'countdown.minutes': 'M',
    'countdown.daysOne': 'day',
    'countdown.daysMany': 'days',
    'countdown.hoursOne': 'hour',
    'countdown.hoursMany': 'hours',
    'countdown.minutesOne': 'minute',
    'countdown.minutesMany': 'minutes',
    'countdown.aria':
      '{d} {du}, {h} {hu} and {m} {mu} until the release of GTA VI on 19 November 2026',

    'footer.youtube': 'YouTube',
    'footer.discord': 'Discord',
    'footer.label': 'Site footer',

    'list.heading': 'ALL POSTS, NEWEST FIRST',
    'list.empty': 'No posts yet.',
    'list.countOne': '{n} post',
    'list.countMany': '{n} posts',
    'featured.label': 'FEATURED',

    'cat.news': 'News',
    'cat.guides': 'Guides',

    'filter.label': 'Filter posts by category',
    'filter.all': 'All',

    'list.loadMore': 'LOAD MORE',
    'list.submit': 'SUBMIT NEWS',
    'list.noResults': 'No posts match.',

    'pill.likes': '{n} likes',

    'crumb.label': 'Breadcrumb',
    'crumb.home': 'Home',

    'post.readingTime': '{n} min read',
    'post.source': 'Source:',
    'post.like': 'Like this post',
    'post.liked': 'You liked this post',
  },

  nl: {
    'site.description': 'Een onafhankelijke GTA-fansite die aftelt naar Grand Theft Auto VI.',
    'site.tagline': 'Een onafhankelijke fansite over Grand Theft Auto, aftellend naar GTA VI.',
    'site.disclaimer':
      'Megamundo is een onafhankelijke fansite. Niet verbonden aan, goedgekeurd door of geassocieerd met Rockstar Games of Take-Two Interactive. Alle merken zijn eigendom van hun respectieve eigenaars.',

    'skip.content': 'Naar de inhoud',

    'nav.label': 'Hoofdnavigatie',
    'nav.home': 'Home',
    'nav.game': 'Game',
    'nav.guides': 'Gidsen',
    'nav.clips': 'Dagelijkse clips',
    'nav.streams': 'Streams',
    'nav.map': 'Kaart',
    'nav.open': 'Menu openen',
    'nav.close': 'Menu sluiten',

    'search.placeholder': 'Zoeken',
    'search.label': 'Zoek posts op titel',

    'lang.label': 'Taal',
    'theme.label': 'Thema',
    'theme.night': 'Nacht',
    'theme.day': 'Dag',
    'theme.toggle': 'Wissel tussen het nacht- en dagthema',

    'countdown.suffix': 'TOT GTA VI',
    'countdown.days': 'D',
    'countdown.hours': 'U',
    'countdown.minutes': 'M',
    'countdown.daysOne': 'dag',
    'countdown.daysMany': 'dagen',
    'countdown.hoursOne': 'uur',
    'countdown.hoursMany': 'uur',
    'countdown.minutesOne': 'minuut',
    'countdown.minutesMany': 'minuten',
    'countdown.aria':
      '{d} {du}, {h} {hu} en {m} {mu} tot de release van GTA VI op 19 november 2026',

    'footer.label': 'Voettekst',

    'list.heading': 'ALLE POSTS, NIEUWSTE EERST',
    'list.empty': 'Nog geen posts.',
    'list.countOne': '{n} post',
    'list.countMany': '{n} posts',
    'featured.label': 'UITGELICHT',

    'cat.news': 'Nieuws',
    'cat.guides': 'Gidsen',

    'filter.label': 'Filter posts op categorie',
    'filter.all': 'Alles',

    'list.loadMore': 'MEER LADEN',
    'list.submit': 'NIEUWS INSTUREN',
    'list.noResults': 'Geen posts gevonden.',

    'pill.likes': '{n} likes',

    'crumb.label': 'Kruimelpad',
    'crumb.home': 'Home',

    'post.readingTime': '{n} min lezen',
    'post.source': 'Bron:',
    'post.like': 'Deze post liken',
    'post.liked': 'Je vindt deze post leuk',
  },

  fr: {
    'site.description': 'Un site de fans indépendant qui compte les jours jusqu’à Grand Theft Auto VI.',
    'site.tagline': 'Un site de fans indépendant sur Grand Theft Auto, en route vers GTA VI.',
    'site.disclaimer':
      'Megamundo est un site de fans indépendant. Sans lien, approbation ni association avec Rockstar Games ou Take-Two Interactive. Toutes les marques appartiennent à leurs propriétaires respectifs.',

    'skip.content': 'Aller au contenu',

    'nav.label': 'Navigation principale',
    'nav.home': 'Accueil',
    'nav.game': 'Jeu',
    'nav.guides': 'Guides',
    'nav.clips': 'Clips du jour',
    'nav.streams': 'Streams',
    'nav.map': 'Carte',
    'nav.open': 'Ouvrir le menu',
    'nav.close': 'Fermer le menu',

    'search.placeholder': 'Rechercher',
    'search.label': 'Rechercher un article par titre',

    'lang.label': 'Langue',
    'theme.label': 'Thème',
    'theme.night': 'Nuit',
    'theme.day': 'Jour',
    'theme.toggle': 'Basculer entre le thème nuit et jour',

    'countdown.suffix': 'AVANT GTA VI',
    'countdown.days': 'J',
    'countdown.hours': 'H',
    'countdown.minutes': 'M',
    'countdown.daysOne': 'jour',
    'countdown.daysMany': 'jours',
    'countdown.hoursOne': 'heure',
    'countdown.hoursMany': 'heures',
    'countdown.minutesOne': 'minute',
    'countdown.minutesMany': 'minutes',
    'countdown.aria':
      '{d} {du}, {h} {hu} et {m} {mu} avant la sortie de GTA VI le 19 novembre 2026',

    'footer.label': 'Pied de page',

    'list.heading': 'TOUS LES ARTICLES, DU PLUS RÉCENT',
    'list.empty': 'Pas encore d’articles.',
    'list.countOne': '{n} article',
    'list.countMany': '{n} articles',
    'featured.label': 'À LA UNE',

    'cat.news': 'Actus',
    'cat.guides': 'Guides',

    'filter.label': 'Filtrer les articles par catégorie',
    'filter.all': 'Tout',

    'list.loadMore': 'VOIR PLUS',
    'list.submit': 'PROPOSER UNE ACTU',
    'list.noResults': 'Aucun article ne correspond.',

    'pill.likes': '{n} j’aime',

    'crumb.label': 'Fil d’Ariane',
    'crumb.home': 'Accueil',

    'post.readingTime': '{n} min de lecture',
    'post.source': 'Source :',
    'post.like': 'Aimer cet article',
    'post.liked': 'Vous aimez cet article',
  },

  es: {
    'site.description': 'Un sitio de fans independiente que cuenta los días hasta Grand Theft Auto VI.',
    'site.tagline': 'Un sitio de fans independiente sobre Grand Theft Auto, camino a GTA VI.',
    'site.disclaimer':
      'Megamundo es un sitio de fans independiente. Sin vínculo, respaldo ni asociación con Rockstar Games o Take-Two Interactive. Todas las marcas pertenecen a sus respectivos propietarios.',

    'skip.content': 'Ir al contenido',

    'nav.label': 'Navegación principal',
    'nav.home': 'Inicio',
    'nav.game': 'Juego',
    'nav.guides': 'Guías',
    'nav.clips': 'Clips del día',
    'nav.streams': 'Streams',
    'nav.map': 'Mapa',
    'nav.open': 'Abrir el menú',
    'nav.close': 'Cerrar el menú',

    'search.placeholder': 'Buscar',
    'search.label': 'Buscar entradas por título',

    'lang.label': 'Idioma',
    'theme.label': 'Tema',
    'theme.night': 'Noche',
    'theme.day': 'Día',
    'theme.toggle': 'Cambiar entre el tema noche y día',

    'countdown.suffix': 'HASTA GTA VI',
    'countdown.days': 'D',
    'countdown.hours': 'H',
    'countdown.minutes': 'M',
    'countdown.daysOne': 'día',
    'countdown.daysMany': 'días',
    'countdown.hoursOne': 'hora',
    'countdown.hoursMany': 'horas',
    'countdown.minutesOne': 'minuto',
    'countdown.minutesMany': 'minutos',
    'countdown.aria':
      '{d} {du}, {h} {hu} y {m} {mu} hasta el lanzamiento de GTA VI el 19 de noviembre de 2026',

    'footer.label': 'Pie de página',

    'list.heading': 'TODAS LAS ENTRADAS, MÁS RECIENTES PRIMERO',
    'list.empty': 'Todavía no hay entradas.',
    'list.countOne': '{n} entrada',
    'list.countMany': '{n} entradas',
    'featured.label': 'DESTACADO',

    'cat.news': 'Noticias',
    'cat.guides': 'Guías',

    'filter.label': 'Filtrar entradas por categoría',
    'filter.all': 'Todo',

    'list.loadMore': 'VER MÁS',
    'list.submit': 'ENVIAR NOTICIA',
    'list.noResults': 'No hay entradas que coincidan.',

    'pill.likes': '{n} me gusta',

    'crumb.label': 'Ruta de navegación',
    'crumb.home': 'Inicio',

    'post.readingTime': '{n} min de lectura',
    'post.source': 'Fuente:',
    'post.like': 'Dar me gusta a esta entrada',
    'post.liked': 'Te gusta esta entrada',
  },

  it: {
    'site.description': 'Un sito di fan indipendente che conta i giorni fino a Grand Theft Auto VI.',
    'site.tagline': 'Un sito di fan indipendente su Grand Theft Auto, in attesa di GTA VI.',
    'site.disclaimer':
      'Megamundo è un sito di fan indipendente. Non affiliato, approvato o associato a Rockstar Games o Take-Two Interactive. Tutti i marchi appartengono ai rispettivi proprietari.',

    'skip.content': 'Vai al contenuto',

    'nav.label': 'Navigazione principale',
    'nav.home': 'Home',
    'nav.game': 'Gioco',
    'nav.guides': 'Guide',
    'nav.clips': 'Clip del giorno',
    'nav.streams': 'Stream',
    'nav.map': 'Mappa',
    'nav.open': 'Apri il menu',
    'nav.close': 'Chiudi il menu',

    'search.placeholder': 'Cerca',
    'search.label': 'Cerca gli articoli per titolo',

    'lang.label': 'Lingua',
    'theme.label': 'Tema',
    'theme.night': 'Notte',
    'theme.day': 'Giorno',
    'theme.toggle': 'Passa dal tema notte a quello giorno',

    'countdown.suffix': 'A GTA VI',
    'countdown.days': 'G',
    'countdown.hours': 'O',
    'countdown.minutes': 'M',
    'countdown.daysOne': 'giorno',
    'countdown.daysMany': 'giorni',
    'countdown.hoursOne': 'ora',
    'countdown.hoursMany': 'ore',
    'countdown.minutesOne': 'minuto',
    'countdown.minutesMany': 'minuti',
    'countdown.aria':
      '{d} {du}, {h} {hu} e {m} {mu} all’uscita di GTA VI il 19 novembre 2026',

    'footer.label': 'Piè di pagina',

    'list.heading': 'TUTTI GLI ARTICOLI, DAL PIÙ RECENTE',
    'list.empty': 'Ancora nessun articolo.',
    'list.countOne': '{n} articolo',
    'list.countMany': '{n} articoli',
    'featured.label': 'IN EVIDENZA',

    'cat.news': 'Notizie',
    'cat.guides': 'Guide',

    'filter.label': 'Filtra gli articoli per categoria',
    'filter.all': 'Tutto',

    'list.loadMore': 'MOSTRA ALTRO',
    'list.submit': 'PROPONI UNA NOTIZIA',
    'list.noResults': 'Nessun articolo corrisponde.',

    'pill.likes': '{n} mi piace',

    'crumb.label': 'Percorso di navigazione',
    'crumb.home': 'Home',

    'post.readingTime': '{n} min di lettura',
    'post.source': 'Fonte:',
    'post.like': 'Metti mi piace a questo articolo',
    'post.liked': 'Ti piace questo articolo',
  },

  de: {
    'site.description': 'Eine unabhängige GTA-Fanseite, die bis Grand Theft Auto VI zählt.',
    'site.tagline': 'Eine unabhängige Fanseite über Grand Theft Auto, auf dem Weg zu GTA VI.',
    'site.disclaimer':
      'Megamundo ist eine unabhängige Fanseite. Nicht verbunden mit, unterstützt von oder assoziiert mit Rockstar Games oder Take-Two Interactive. Alle Marken gehören ihren jeweiligen Eigentümern.',

    'skip.content': 'Zum Inhalt springen',

    'nav.label': 'Hauptnavigation',
    'nav.home': 'Start',
    'nav.game': 'Spiel',
    'nav.guides': 'Guides',
    'nav.clips': 'Clips des Tages',
    'nav.streams': 'Streams',
    'nav.map': 'Karte',
    'nav.open': 'Menü öffnen',
    'nav.close': 'Menü schließen',

    'search.placeholder': 'Suchen',
    'search.label': 'Beiträge nach Titel suchen',

    'lang.label': 'Sprache',
    'theme.label': 'Thema',
    'theme.night': 'Nacht',
    'theme.day': 'Tag',
    'theme.toggle': 'Zwischen Nacht- und Tagthema wechseln',

    'countdown.suffix': 'BIS GTA VI',
    'countdown.days': 'T',
    'countdown.hours': 'S',
    'countdown.minutes': 'M',
    'countdown.daysOne': 'Tag',
    'countdown.daysMany': 'Tage',
    'countdown.hoursOne': 'Stunde',
    'countdown.hoursMany': 'Stunden',
    'countdown.minutesOne': 'Minute',
    'countdown.minutesMany': 'Minuten',
    'countdown.aria':
      '{d} {du}, {h} {hu} und {m} {mu} bis zum Release von GTA VI am 19. November 2026',

    'footer.label': 'Fußzeile',

    'list.heading': 'ALLE BEITRÄGE, NEUESTE ZUERST',
    'list.empty': 'Noch keine Beiträge.',
    'list.countOne': '{n} Beitrag',
    'list.countMany': '{n} Beiträge',
    'featured.label': 'HERVORGEHOBEN',

    'cat.news': 'News',
    'cat.guides': 'Guides',

    'filter.label': 'Beiträge nach Kategorie filtern',
    'filter.all': 'Alle',

    'list.loadMore': 'MEHR LADEN',
    'list.submit': 'NEWS EINSENDEN',
    'list.noResults': 'Keine Beiträge gefunden.',

    'pill.likes': '{n} Likes',

    'crumb.label': 'Brotkrumennavigation',
    'crumb.home': 'Start',

    'post.readingTime': '{n} Min. Lesezeit',
    'post.source': 'Quelle:',
    'post.like': 'Diesen Beitrag liken',
    'post.liked': 'Du magst diesen Beitrag',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];
