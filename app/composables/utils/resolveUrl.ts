/**
 * Checks if a string is an absolute HTTP/HTTPS URL in a case insensitive manner.
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Checks if file_url could or should be cached.
 *
 * Excludes:
 * - Data URLs (data:)
 * - Blob URLs (blob:)
 * - Empty strings
 */
export function isCacheable(url: string): boolean {
  if (!url || url.length === 0) return false;

  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return false;
  }

  return true;
}

/**
 * Resolves a URL against a base URL.
 * Works in both main thread and Web Workers.
 *
 * @param url - The URL to resolve (absolute or relative)
 * @param baseUrl - The base URL to resolve against. If not provided, relative URLs are returned as-is.
 * @returns Fully resolved absolute URL, or safe fallback
 */
export function resolveUrl(url: string, baseUrl?: string): string {
  // If already absolute or no base URL, return as-is
  if (isAbsoluteUrl(url) || !baseUrl) {
    return url;
  }

  try {
    return new URL(url, baseUrl).href;
  } catch {
    // If URL resolution fails, return as-is
    console.warn(`Failed to resolve URL: ${url} against ${baseUrl}`);
    return url;
  }
}



