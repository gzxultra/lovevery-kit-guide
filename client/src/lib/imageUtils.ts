/**
 * Image optimization utilities for Contentful images.
 * 
 * Contentful's Images API supports on-the-fly transformations:
 * - ?w=WIDTH - resize to width
 * - ?h=HEIGHT - resize to height
 * - ?fm=webp - convert to WebP format
 * - ?q=QUALITY - set quality (1-100)
 * - ?fit=fill|pad|scale|crop|thumb - fit mode
 * 
 * @see https://www.contentful.com/developers/docs/references/images-api/
 */

const CONTENTFUL_DOMAIN = 'images.ctfassets.net';

/**
 * Optimize a Contentful image URL by adding size and format parameters.
 * Returns the original URL unchanged if it's not a Contentful image.
 */
export function optimizeImageUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'avif';
    fit?: 'fill' | 'pad' | 'scale' | 'crop' | 'thumb';
  } = {}
): string {
  if (!url || !url.includes(CONTENTFUL_DOMAIN)) {
    return url;
  }

  // Don't add params if they already exist
  if (url.includes('?w=') || url.includes('&w=')) {
    return url;
  }

  const params = new URLSearchParams();
  
  if (options.width) params.set('w', String(options.width));
  if (options.height) params.set('h', String(options.height));
  if (options.quality) params.set('q', String(options.quality));
  if (options.format) params.set('fm', options.format);
  if (options.fit) params.set('fit', options.fit);

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params.toString()}`;
}

/**
 * Get optimized URL for toy thumbnail images (displayed at ~80-112px in cards)
 */
export function getToyThumbnailUrl(url: string): string {
  return optimizeImageUrl(url, { width: 224, format: 'webp', quality: 80 });
}

/**
 * Get optimized URL for kit hero images (displayed at ~200-288px)
 */
export function getKitHeroOptimizedUrl(url: string): string {
  return optimizeImageUrl(url, { width: 576, format: 'webp', quality: 80 });
}

/**
 * Get optimized URL for kit card thumbnails on homepage (displayed at ~56-64px)
 */
export function getKitCardThumbnailUrl(url: string): string {
  return optimizeImageUrl(url, { width: 128, format: 'webp', quality: 80 });
}

/**
 * Get optimized URL for alternative product images (displayed at ~64-80px)
 */
export function getAlternativeThumbnailUrl(url: string): string {
  // Alternative images are from Amazon, not Contentful - return as-is
  return url;
}

/**
 * Get optimized URL for lightbox/full-size images
 */
export function getLightboxImageUrl(url: string): string {
  return optimizeImageUrl(url, { width: 1200, format: 'webp', quality: 85 });
}

/**
 * Darken a hex color to meet WCAG AA contrast ratio (4.5:1) against white.
 * Used for kit theme colors when displayed as text on white backgrounds.
 */
export function getAccessibleTextColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance
  const luminance = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const contrastWithWhite = (r: number, g: number, b: number) => {
    const l = 0.2126 * luminance(r) + 0.7152 * luminance(g) + 0.0722 * luminance(b);
    return (1.05) / (l + 0.05); // white luminance = 1.0
  };

  // Darken until we reach 5.5:1 contrast ratio against white
  // (higher target to ensure compliance on tinted backgrounds like stage badges)
  let factor = 1.0;
  while (factor > 0.4 && contrastWithWhite(
    Math.round(r * factor),
    Math.round(g * factor),
    Math.round(b * factor)
  ) < 5.5) {
    factor -= 0.05;
  }

  const dr = Math.round(r * factor);
  const dg = Math.round(g * factor);
  const db = Math.round(b * factor);

  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
}
