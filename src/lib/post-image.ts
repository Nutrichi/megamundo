/*
 * De maten van het beeld van een post, op één plek. PostImage gebruikt ze
 * voor zijn <img>, en de homepage voor het vooraf laden van het uitgelichte
 * beeld. Lopen die twee uit elkaar, dan laadt de browser het beeld twee keer.
 *
 * Het uitgelichte beeld is het grootste element boven de vouw op de
 * homepage, en dus de LCP (§17). Op een telefoon is het 378 bij 213 pixels
 * op een scherm van 412 breed; bij een pixeldichtheid van 1,75 is dat zo'n
 * 660 beeldpunten. Tot 13 september 2026 kreeg die telefoon de versie van
 * 900, want `sizes` zei 100vw; nu zegt het de werkelijke breedte en is er
 * een versie van 720.
 */

import { getImage } from 'astro:assets';
import type { Post } from './posts';

type PostImageSource = NonNullable<Post['image']>;

export const featuredImage = {
  widths: [420, 720, 900, 1400],
  /* De contentkolom op mobiel: het scherm min 16 px aan elke kant en de spectrumbalk. */
  sizes: '(max-width: 899px) calc(100vw - 34px), 600px',
};

export const heroImage = {
  widths: [640, 960, 1280, 1600],
  sizes: '(max-width: 899px) 100vw, 1180px',
};

/**
 * De attributen voor `<link rel="preload" as="image">` van het uitgelichte
 * beeld. Zelfde bron, breedtes en formaat als de <Image> in PostImage, dus
 * dezelfde bestanden: de browser haalt het beeld één keer, maar begint er al
 * mee voor hij de rest van de pagina gelezen heeft.
 */
export async function featuredPreload(image: PostImageSource) {
  const result = await getImage({
    src: image,
    widths: featuredImage.widths,
    sizes: featuredImage.sizes,
  });
  return {
    href: result.src,
    imagesrcset: result.srcSet.attribute,
    imagesizes: featuredImage.sizes,
  };
}
