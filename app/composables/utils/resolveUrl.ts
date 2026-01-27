/**
 * Resolves a URL against a base URL.
 * Works in both main thread and Web Workers.
 *
 * @param url - The URL to resolve (absolute or relative)
 * @param baseUrl - The base URL to resolve against
 * @returns Fully resolved absolute URL
 */
export function resolveUrl(url: string, baseUrl: string): string {
  // If already absolute, return as-is
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  try {
    return new URL(url, baseUrl).href;
  } catch {
    // If URL resolution fails, return original
    console.warn(`Failed to resolve URL: ${url} against ${baseUrl}`);
    return url;
  }
}



