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
      'Independent fansite. Not affiliated with or endorsed by Rockstar Games or Take-Two Interactive. All trademarks belong to their owners.',

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

    'footer.copyright': '© {y} megamundo.be',
    'footer.youtube': 'YouTube',
    'footer.discord': 'Discord',
    'footer.label': 'Site footer',

    'list.heading': 'ALL POSTS, NEWEST FIRST',
    'list.empty': 'No posts yet.',
    'list.countOne': '{n} post',
    'list.countMany': '{n} posts',
    'featured.label': 'FEATURED',


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

    'map.title': 'Map of Leonida',
    'map.label': 'Interactive map of Leonida',
    'map.description': 'The map of Leonida, area by area: Vice City, Port Gellhorn, Mount Kalaga National Park, Ambrosia, Grassrivers and the Leonida Keys.',
    'map.noscript': 'The map needs JavaScript. The areas are listed below and each one has its own page.',
    'map.credit': 'Base map {map} from {site}.',
    'map.regions': 'AREAS',
    'map.realName': 'Real-world reference',
    'map.backToMap': 'Back to the map',
    'crumb.game': 'Game',

    'submit.title': 'Send in news',
    'submit.intro': 'Spotted something we missed? Tell us. Every tip is read, nothing is published automatically, and there is no reply unless something is unclear.',
    'submit.fieldTitle': 'What happened',
    'submit.fieldTitleHint': 'One line, the way you would write the headline.',
    'submit.fieldSource': 'Link to the source',
    'submit.fieldSourceHint': 'Optional, but it helps. Rockstar, a news site, a post.',
    'submit.fieldNote': 'Anything else',
    'submit.fieldNoteHint': 'Optional.',
    'submit.fieldName': 'Your name or nickname',
    'submit.fieldNameHint': 'Optional, and only so you can be thanked.',
    'submit.send': 'SEND',
    'submit.sending': 'SENDING',
    'submit.thanks': 'Thanks. Your tip has arrived.',
    'submit.thanksNote': 'It goes to one person, who reads everything. There is no reply unless something is unclear.',
    'submit.errorEmpty': 'Write down what happened first.',
    'submit.errorNetwork': 'Sending failed. Try again later.',
    'submit.errorStorage': 'This browser blocks local storage, so sending is not possible.',
    'submit.errorTooFast': 'That went too fast. Read it over and send again.',
  },

  nl: {
    'site.description': 'Een onafhankelijke GTA-fansite die aftelt naar Grand Theft Auto VI.',
    'site.tagline': 'Een onafhankelijke fansite over Grand Theft Auto, aftellend naar GTA VI.',
    'site.disclaimer':
      'Onafhankelijke fansite. Geen band met Rockstar Games of Take-Two Interactive. Alle merken zijn van hun eigenaars.',

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

    'footer.copyright': '© {y} megamundo.be',
    'footer.label': 'Voettekst',

    'list.heading': 'ALLE POSTS, NIEUWSTE EERST',
    'list.empty': 'Nog geen posts.',
    'list.countOne': '{n} post',
    'list.countMany': '{n} posts',
    'featured.label': 'UITGELICHT',


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

    'map.title': 'Kaart van Leonida',
    'map.label': 'Interactieve kaart van Leonida',
    'map.description': 'De kaart van Leonida, gebied per gebied: Vice City, Port Gellhorn, Mount Kalaga National Park, Ambrosia, Grassrivers en de Leonida Keys.',
    'map.noscript': 'De kaart heeft JavaScript nodig. De gebieden staan hieronder en elk gebied heeft een eigen pagina.',
    'map.credit': 'Basiskaart {map} van {site}.',
    'map.regions': 'GEBIEDEN',
    'map.realName': 'Werkelijke tegenhanger',
    'map.backToMap': 'Terug naar de kaart',
    'crumb.game': 'Game',

    'submit.title': 'Nieuws insturen',
    'submit.intro': 'Iets gezien dat wij gemist hebben? Laat het weten. Elke tip wordt gelezen, er wordt niets automatisch gepubliceerd, en er komt geen antwoord tenzij iets onduidelijk is.',
    'submit.fieldTitle': 'Wat er gebeurd is',
    'submit.fieldTitleHint': 'Eén regel, zoals je de kop zou schrijven.',
    'submit.fieldSource': 'Link naar de bron',
    'submit.fieldSourceHint': 'Mag leeg blijven, maar het helpt. Rockstar, een nieuwssite, een bericht.',
    'submit.fieldNote': 'Verder nog iets',
    'submit.fieldNoteHint': 'Mag leeg blijven.',
    'submit.fieldName': 'Je naam of nickname',
    'submit.fieldNameHint': 'Mag leeg blijven, en dient alleen om je te bedanken.',
    'submit.send': 'VERSTUREN',
    'submit.sending': 'BEZIG',
    'submit.thanks': 'Bedankt. Je tip is aangekomen.',
    'submit.thanksNote': 'Hij gaat naar één persoon, die alles leest. Er komt geen antwoord tenzij iets onduidelijk is.',
    'submit.errorEmpty': 'Schrijf eerst op wat er gebeurd is.',
    'submit.errorNetwork': 'Versturen is niet gelukt. Probeer het later opnieuw.',
    'submit.errorStorage': 'Deze browser blokkeert lokale opslag, dus versturen kan niet.',
    'submit.errorTooFast': 'Dat ging te snel. Lees het na en verstuur opnieuw.',
  },

  fr: {
    'site.description': 'Un site de fans indépendant qui compte les jours jusqu’à Grand Theft Auto VI.',
    'site.tagline': 'Un site de fans indépendant sur Grand Theft Auto, en route vers GTA VI.',
    'site.disclaimer':
      'Site de fans indépendant. Sans lien avec Rockstar Games ni Take-Two Interactive. Toutes les marques appartiennent à leurs propriétaires.',

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

    'footer.copyright': '© {y} megamundo.be',
    'footer.label': 'Pied de page',

    'list.heading': 'TOUS LES ARTICLES, DU PLUS RÉCENT',
    'list.empty': 'Pas encore d’articles.',
    'list.countOne': '{n} article',
    'list.countMany': '{n} articles',
    'featured.label': 'À LA UNE',


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

    'map.title': 'Carte de Leonida',
    'map.label': 'Carte interactive de Leonida',
    'map.description': 'La carte de Leonida, zone par zone : Vice City, Port Gellhorn, Mount Kalaga National Park, Ambrosia, Grassrivers et les Leonida Keys.',
    'map.noscript': 'La carte a besoin de JavaScript. Les zones sont listées ci-dessous et chacune a sa propre page.',
    'map.credit': 'Fond de carte {map} de {site}.',
    'map.regions': 'ZONES',
    'map.realName': 'Référence réelle',
    'map.backToMap': 'Retour à la carte',
    'crumb.game': 'Jeu',

    'submit.title': 'Proposer une actu',
    'submit.intro': 'Vous avez vu quelque chose qui nous a échappé ? Dites-le nous. Chaque message est lu, rien n’est publié automatiquement, et il n’y a pas de réponse sauf si quelque chose n’est pas clair.',
    'submit.fieldTitle': 'Ce qui s’est passé',
    'submit.fieldTitleHint': 'Une ligne, comme vous écririez le titre.',
    'submit.fieldSource': 'Lien vers la source',
    'submit.fieldSourceHint': 'Facultatif, mais utile. Rockstar, un site d’actualité, un message.',
    'submit.fieldNote': 'Autre chose',
    'submit.fieldNoteHint': 'Facultatif.',
    'submit.fieldName': 'Votre nom ou pseudo',
    'submit.fieldNameHint': 'Facultatif, uniquement pour pouvoir vous remercier.',
    'submit.send': 'ENVOYER',
    'submit.sending': 'ENVOI',
    'submit.thanks': 'Merci. Votre message est bien arrivé.',
    'submit.thanksNote': 'Il va à une seule personne, qui lit tout. Il n’y a pas de réponse sauf si quelque chose n’est pas clair.',
    'submit.errorEmpty': 'Écrivez d’abord ce qui s’est passé.',
    'submit.errorNetwork': 'L’envoi a échoué. Réessayez plus tard.',
    'submit.errorStorage': 'Ce navigateur bloque le stockage local, l’envoi est donc impossible.',
    'submit.errorTooFast': 'C’était trop rapide. Relisez et renvoyez.',
  },

  es: {
    'site.description': 'Un sitio de fans independiente que cuenta los días hasta Grand Theft Auto VI.',
    'site.tagline': 'Un sitio de fans independiente sobre Grand Theft Auto, camino a GTA VI.',
    'site.disclaimer':
      'Sitio de fans independiente. Sin vínculo con Rockstar Games ni Take-Two Interactive. Todas las marcas pertenecen a sus propietarios.',

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

    'footer.copyright': '© {y} megamundo.be',
    'footer.label': 'Pie de página',

    'list.heading': 'TODAS LAS ENTRADAS, MÁS RECIENTES PRIMERO',
    'list.empty': 'Todavía no hay entradas.',
    'list.countOne': '{n} entrada',
    'list.countMany': '{n} entradas',
    'featured.label': 'DESTACADO',


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

    'map.title': 'Mapa de Leonida',
    'map.label': 'Mapa interactivo de Leonida',
    'map.description': 'El mapa de Leonida, zona por zona: Vice City, Port Gellhorn, Mount Kalaga National Park, Ambrosia, Grassrivers y los Leonida Keys.',
    'map.noscript': 'El mapa necesita JavaScript. Las zonas están listadas abajo y cada una tiene su propia página.',
    'map.credit': 'Mapa base {map} de {site}.',
    'map.regions': 'ZONAS',
    'map.realName': 'Referencia real',
    'map.backToMap': 'Volver al mapa',
    'crumb.game': 'Juego',

    'submit.title': 'Enviar una noticia',
    'submit.intro': '¿Has visto algo que se nos ha pasado? Cuéntanoslo. Todo aviso se lee, nada se publica automáticamente, y no hay respuesta salvo que algo no quede claro.',
    'submit.fieldTitle': 'Qué ha pasado',
    'submit.fieldTitleHint': 'Una línea, como escribirías el titular.',
    'submit.fieldSource': 'Enlace a la fuente',
    'submit.fieldSourceHint': 'Opcional, pero ayuda. Rockstar, un sitio de noticias, una publicación.',
    'submit.fieldNote': 'Algo más',
    'submit.fieldNoteHint': 'Opcional.',
    'submit.fieldName': 'Tu nombre o apodo',
    'submit.fieldNameHint': 'Opcional, y solo para poder darte las gracias.',
    'submit.send': 'ENVIAR',
    'submit.sending': 'ENVIANDO',
    'submit.thanks': 'Gracias. Tu aviso ha llegado.',
    'submit.thanksNote': 'Va a una sola persona, que lo lee todo. No hay respuesta salvo que algo no quede claro.',
    'submit.errorEmpty': 'Escribe primero qué ha pasado.',
    'submit.errorNetwork': 'El envío ha fallado. Inténtalo más tarde.',
    'submit.errorStorage': 'Este navegador bloquea el almacenamiento local, así que no se puede enviar.',
    'submit.errorTooFast': 'Ha ido demasiado rápido. Reléelo y envíalo de nuevo.',
  },

  it: {
    'site.description': 'Un sito di fan indipendente che conta i giorni fino a Grand Theft Auto VI.',
    'site.tagline': 'Un sito di fan indipendente su Grand Theft Auto, in attesa di GTA VI.',
    'site.disclaimer':
      'Sito di fan indipendente. Nessun legame con Rockstar Games o Take-Two Interactive. Tutti i marchi appartengono ai rispettivi proprietari.',

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

    'footer.copyright': '© {y} megamundo.be',
    'footer.label': 'Piè di pagina',

    'list.heading': 'TUTTI GLI ARTICOLI, DAL PIÙ RECENTE',
    'list.empty': 'Ancora nessun articolo.',
    'list.countOne': '{n} articolo',
    'list.countMany': '{n} articoli',
    'featured.label': 'IN EVIDENZA',


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

    'map.title': 'Mappa di Leonida',
    'map.label': 'Mappa interattiva di Leonida',
    'map.description': 'La mappa di Leonida, zona per zona: Vice City, Port Gellhorn, Mount Kalaga National Park, Ambrosia, Grassrivers e le Leonida Keys.',
    'map.noscript': 'La mappa richiede JavaScript. Le zone sono elencate qui sotto e ognuna ha una pagina propria.',
    'map.credit': 'Mappa di base {map} di {site}.',
    'map.regions': 'ZONE',
    'map.realName': 'Riferimento reale',
    'map.backToMap': 'Torna alla mappa',
    'crumb.game': 'Gioco',

    'submit.title': 'Proponi una notizia',
    'submit.intro': 'Hai visto qualcosa che ci è sfuggito? Faccelo sapere. Ogni segnalazione viene letta, niente viene pubblicato automaticamente, e non c’è risposta a meno che qualcosa non sia chiaro.',
    'submit.fieldTitle': 'Cosa è successo',
    'submit.fieldTitleHint': 'Una riga, come scriveresti il titolo.',
    'submit.fieldSource': 'Link alla fonte',
    'submit.fieldSourceHint': 'Facoltativo, ma aiuta. Rockstar, un sito di notizie, un post.',
    'submit.fieldNote': 'Altro',
    'submit.fieldNoteHint': 'Facoltativo.',
    'submit.fieldName': 'Il tuo nome o nickname',
    'submit.fieldNameHint': 'Facoltativo, serve solo per poterti ringraziare.',
    'submit.send': 'INVIA',
    'submit.sending': 'INVIO',
    'submit.thanks': 'Grazie. La tua segnalazione è arrivata.',
    'submit.thanksNote': 'Va a una sola persona, che legge tutto. Non c’è risposta a meno che qualcosa non sia chiaro.',
    'submit.errorEmpty': 'Scrivi prima cosa è successo.',
    'submit.errorNetwork': 'L’invio non è riuscito. Riprova più tardi.',
    'submit.errorStorage': 'Questo browser blocca la memoria locale, quindi non si può inviare.',
    'submit.errorTooFast': 'È andata troppo veloce. Rileggi e invia di nuovo.',
  },

  de: {
    'site.description': 'Eine unabhängige GTA-Fanseite, die bis Grand Theft Auto VI zählt.',
    'site.tagline': 'Eine unabhängige Fanseite über Grand Theft Auto, auf dem Weg zu GTA VI.',
    'site.disclaimer':
      'Unabhängige Fanseite. Keine Verbindung zu Rockstar Games oder Take-Two Interactive. Alle Marken gehören ihren Eigentümern.',

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

    'footer.copyright': '© {y} megamundo.be',
    'footer.label': 'Fußzeile',

    'list.heading': 'ALLE BEITRÄGE, NEUESTE ZUERST',
    'list.empty': 'Noch keine Beiträge.',
    'list.countOne': '{n} Beitrag',
    'list.countMany': '{n} Beiträge',
    'featured.label': 'HERVORGEHOBEN',


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

    'map.title': 'Karte von Leonida',
    'map.label': 'Interaktive Karte von Leonida',
    'map.description': 'Die Karte von Leonida, Gebiet für Gebiet: Vice City, Port Gellhorn, Mount Kalaga National Park, Ambrosia, Grassrivers und die Leonida Keys.',
    'map.noscript': 'Die Karte braucht JavaScript. Die Gebiete stehen unten und jedes hat eine eigene Seite.',
    'map.credit': 'Basiskarte {map} von {site}.',
    'map.regions': 'GEBIETE',
    'map.realName': 'Reales Vorbild',
    'map.backToMap': 'Zurück zur Karte',
    'crumb.game': 'Spiel',

    'submit.title': 'News einsenden',
    'submit.intro': 'Etwas gesehen, das uns entgangen ist? Sag Bescheid. Jeder Hinweis wird gelesen, nichts wird automatisch veröffentlicht, und es gibt keine Antwort, außer wenn etwas unklar ist.',
    'submit.fieldTitle': 'Was passiert ist',
    'submit.fieldTitleHint': 'Eine Zeile, so wie du die Überschrift schreiben würdest.',
    'submit.fieldSource': 'Link zur Quelle',
    'submit.fieldSourceHint': 'Optional, hilft aber. Rockstar, eine Nachrichtenseite, ein Beitrag.',
    'submit.fieldNote': 'Sonst noch etwas',
    'submit.fieldNoteHint': 'Optional.',
    'submit.fieldName': 'Dein Name oder Nickname',
    'submit.fieldNameHint': 'Optional, und nur damit man dir danken kann.',
    'submit.send': 'SENDEN',
    'submit.sending': 'SENDET',
    'submit.thanks': 'Danke. Dein Hinweis ist angekommen.',
    'submit.thanksNote': 'Er geht an eine Person, die alles liest. Es gibt keine Antwort, außer wenn etwas unklar ist.',
    'submit.errorEmpty': 'Schreib zuerst auf, was passiert ist.',
    'submit.errorNetwork': 'Das Senden hat nicht geklappt. Versuch es später noch einmal.',
    'submit.errorStorage': 'Dieser Browser blockiert lokalen Speicher, deshalb ist Senden nicht möglich.',
    'submit.errorTooFast': 'Das ging zu schnell. Lies es noch einmal und sende erneut.',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];
