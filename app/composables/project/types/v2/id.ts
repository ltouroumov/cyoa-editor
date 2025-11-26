import { customAlphabet } from 'nanoid';

import { ObjectType } from '~/composables/project/types/v2/objects/base';

const genId = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8);

export function createId(type?: ObjectType | 'style' | 'media'): string {
  switch (type) {
    case ObjectType.page:
      return `p.${genId()}`;
    case ObjectType.row:
      return `r.${genId()}`;
    case ObjectType.choice:
      return `c.${genId()}`;
    case ObjectType.addon:
      return `a.${genId()}`;
    case 'style':
      return `s.${genId()}`;
    case 'media':
      return `m.${genId()}`;
    default:
      return genId();
  }
}
