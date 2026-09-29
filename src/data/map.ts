/*
 * De kaart van Leonida (§9 en fase 3 uit §19).
 *
 * De basiskaart is de gemeenschapskaart YANIS, die op map.stateofleonida.net
 * staat. Nutri heeft daar op 10 september 2026 toestemming voor gekregen van
 * de mensen achter die site. De tegels staan in dit repo, in
 * public/map/tiles, en worden opgehaald met scripts/fetch_map_tiles.py; zo
 * breekt onze kaart niet als zij naar een volgende versie gaan en kost hij
 * hun geen bandbreedte.
 *
 * Bij een nieuwe versie van YANIS: `npm run map:update -- --version vNN`. Dat
 * zet versie, datum en grenzen hieronder mee; kijk daarna of de gebieden
 * nog kloppen.
 */

/** Welke versie van de gemeenschapskaart er in public/map/tiles staat. */
export const version = 'v16.0';
export const versionDate = '2026-09-20';

/** Waar de tegels staan, in het patroon dat Leaflet verwacht. */
export const tileUrl = '/map/tiles/{z}/{x}/{y}.png';

/**
 * De grenzen van het bronbeeld in het platte coördinatenstelsel van de
 * kaart. Leaflet noteert een punt als [y, x]. Sinds v16 is het beeld 21000
 * bij 20000 pixels: x loopt van -17000 tot 4000 en y van -9000 tot 11000.
 * Tot v15 was het 20000 bij 20000, met x van -16500 tot 3500 en y van -8000
 * tot 12000. De plaatsen houden hun coördinaten; alleen de rand verschuift.
 * `npm run map:update` zet deze grenzen mee uit hun yanis.json.
 */
export const fullBounds: [[number, number], [number, number]] = [
  [-9000, -17000],
  [11000, 4000],
];

/**
 * Waar de kaart op opent: het eiland vult het kader.
 *
 * De bronkaart is breder dan Leonida. Links staat een legenda- en
 * creditspaneel van de makers en daaronder een wand met trailerbeelden.
 * Dat wegknippen bleek niet te kunnen: op een laag zoomniveau is één tegel
 * ruim achtduizend eenheden breed, dus de tegel met het paneel raakt elke
 * grens die je trekt en komt toch in beeld.
 *
 * Dus niet knippen maar richten. De kaart opent op het eiland; wie het
 * paneel wil zien, sleept ernaartoe. De legenda is bruikbaar en de credits
 * horen zichtbaar te kunnen zijn, dus verstoppen zou ook niet kloppen.
 */
export const islandBounds: [[number, number], [number, number]] = [
  [-7200, -9900],
  [10700, 3400],
];

/** Zoom 0 tot 6 zijn echte tegels; 7 en 8 rekt Leaflet op. */
export const minZoom = 1;
export const maxZoom = 8;
export const maxNativeZoom = 6;

/*
 * Waar de kaart opent staat niet als getal vast: de viewer past het hele
 * eiland in het kader met fitBounds, en dat hangt af van de schermgrootte.
 */

/** De bronvermelding onder de kaart. */
export const credit = {
  mapName: 'YANIS GTA VI Community Map',
  siteName: 'State of Leonida',
  siteUrl: 'https://map.stateofleonida.net',
};
