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
