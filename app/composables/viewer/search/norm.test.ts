import { describe, expect, it } from 'vitest';
import { foldDiacritics, sanitizeString } from './norm';

describe('foldDiacritics', () => {
  it('strips macron from ō', () => {
    expect(foldDiacritics('Mangekyō')).toBe('Mangekyo');
  });

  it('strips acute accent from é', () => {
    expect(foldDiacritics('café')).toBe('cafe');
  });

  it('strips multiple diacritics', () => {
    expect(foldDiacritics('naïve résumé')).toBe('naive resume');
  });

  it('leaves plain ASCII unchanged', () => {
    expect(foldDiacritics('hello world')).toBe('hello world');
  });

  it('leaves non-Latin characters unchanged', () => {
    expect(foldDiacritics('東京')).toBe('東京');
  });

  it('returns empty string unchanged', () => {
    expect(foldDiacritics('')).toBe('');
  });
});

describe('sanitizeString', () => {
  it('still normalizes em-dash to hyphen', () => {
    expect(sanitizeString('hello\u2013world')).toBe('hello-world');
  });
});
