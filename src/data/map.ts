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
 * Bij een nieuwe versie van YANIS: het script opnieuw draaien met --version,
 * `version` hieronder bijwerken, en nakijken of de gebieden nog kloppen.
 */

/** Welke versie van de gemeenschapskaart er in public/map/tiles staat. */
export const version = 'v15.0';
export const versionDate = '2026-08-23';

/** Waar de tegels staan, in het patroon dat Leaflet verwacht. */
export const tileUrl = '/map/tiles/{z}/{x}/{y}.png';

/**
 * De bronafbeelding is 20000 bij 20000 pixels. In het platte
 * coordinatenstelsel van de kaart loopt x van -16500 tot 3500 en y van
 * -8000 tot 12000. Leaflet noteert een punt als [y, x].
 */
export const fullBounds: [[number, number], [number, number]] = [
  [-8000, -16500],
  [12000, 3500],
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
