const sanitizeChars: Array<[string, '-' | "'" | '"']> = Object.entries({
  // EN DASH / HYPHEN (U+002D)
  '\u1806': '\u002D', // '᠆'
  '\u2010': '\u002D', // '‐'
  '\u2011': '\u002D', // '‑'
  '\u2012': '\u002D', // '‒'
  '\u2013': '\u002D', // '–'
  '\uFE58': '\u002D', // '﹘'
  '\uFE63': '\u002D', // '﹣'
  '\uFF0D': '\u002D', // '－'

  // SINGLE QUOTES (U+0027)
  '\u003C': '\u0027', // '<'
  '\u003E': '\u0027', // '>'
  '\u2018': '\u0027', // '‘'
  '\u2019': '\u0027', // '’'
  '\u201A': '\u0027', // '‚'
  '\u201B': '\u0027', // '‛'
  '\u2039': '\u0027', // '‹'
  '\u203A': '\u0027', // '›'
  '\u275B': '\u0027', // '❛'
  '\u275C': '\u0027', // '❜'
  '\u276E': '\u0027', // '❮'
  '\u276F': '\u0027', // '❯'
  '\uFF07': '\u0027', // '＇'
  '\u300C': '\u0027', // '「'
  '\u300D': '\u0027', // '」'

  // // DOUBLE QUOTES (U+0022)
  '\u00AB': '\u0022', // '«'
  '\u00BB': '\u0022', // '»'
  '\u201C': '\u0022', // '“'
  '\u201D': '\u0022', // '”'
  '\u201E': '\u0022', // '„'
  '\u201F': '\u0022', // '‟'
  '\u275D': '\u0022', // '❝'
  '\u275E': '\u0022', // '❞'
  '\u2E42': '\u0022', // '⹂'
  '\u301D': '\u0022', // '〝'
  '\u301E': '\u0022', // '〞'
  '\u301F': '\u0022', // '〟'
  '\uFF02': '\u0022', // '＂'
  '\u300E': '\u0022', // '『'
  '\u300F': '\u0022', // '』'
});

/** Normalizes non-standard quotes and dashes into a uniform format.  */
export const sanitizeString = (query: string) => {
  return sanitizeChars.reduce((acc, [char, stdChar]) => {
    return acc.replaceAll(char, stdChar);
  }, query);
};
