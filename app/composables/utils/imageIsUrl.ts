export function imageIsUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Checks if an image can be cached. This includes:
 * - Absolute URLs (http:// or https://)
 * - Relative paths (./path, ../path, /path, or just filename)
 *
 * Excludes:
 * - Data URLs (data:)
 * - Blob URLs (blob:)
 * - Empty strings
 */
export function imageIsCacheable(url: string): boolean {
  if (!url || url.length === 0) return false;

  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return false;
  }

  return true;
}
