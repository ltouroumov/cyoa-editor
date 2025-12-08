export function imageIsUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
