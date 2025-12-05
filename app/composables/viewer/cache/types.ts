import type { ViewerProject } from '~/composables/viewer/types';

export type CacheEvent =
  | { type: 'init' }
  | { type: 'cache'; project: ViewerProject };
