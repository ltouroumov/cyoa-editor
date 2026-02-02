/**
 * Checks if a string is a correct HTTP/HTTPS URL in a case insensitive manner.
 */
export function isUrl(url: string): boolean {
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
export function isCacheable(file_url: string): boolean {
  if (!file_url || file_url.length === 0) return false;

  if (file_url.startsWith('data:') || file_url.startsWith('blob:')) {
    return false;
  }

  return true;
}

/**
 * Resolves a URL against a base URL.
 * Works in both main thread and Web Workers.
 *
 * @param file_url - A Url or relative path
 * @param baseUrl - The base URL to resolve against. If not provided, relative paths are returned as-is.
 * @returns Fully resolved URL, or safe fallback
 */
export function resolveUrl(file_url: string, baseUrl?: string): string {
  // If already a URL or no base URL, return as-is
  if (isUrl(file_url) || !baseUrl) {
    return file_url;
  }

  try {
    return new URL(file_url, baseUrl).href;
  } catch {
    // If URL resolution fails, return as-is
    console.warn(`Failed to resolve URL: ${file_url} against ${baseUrl}`);
    return file_url;
  }
}
