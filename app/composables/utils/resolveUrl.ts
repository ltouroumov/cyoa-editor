/**
 * Resolves a project URL against the application base.
 * In a Nuxt SPA, `document.baseURI` is set correctly based on `app.baseURL`.
 *
 * Resolution examples (assuming base is `https://example.com/cyoa/`):
 * - `https://cdn.com/p.json` → `https://cdn.com/p.json` (absolute, unchanged)
 * - `project.json` → `https://example.com/cyoa/project.json`
 * - `./data/p.json` → `https://example.com/cyoa/data/p.json`
 * - `/project.json` → `https://example.com/project.json` (root-relative)
 *
 * @param fileUrl - The URL or path from projects.json
 * @returns Fully resolved absolute URL
 */
export function resolveProjectUrl(fileUrl: string): string {
  // If already absolute, return as-is
  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  return new URL(fileUrl, document.baseURI).href;
}

