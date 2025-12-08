import type { ViewerProject } from '~/composables/viewer/types';

export type CacheEvent =
  | { type: 'init' }
  | { type: 'cache'; project: ViewerProject; refresh?: boolean }
  | { type: 'clear'; project: ViewerProject }
  | { type: 'abort' };

export type CacheResult =
  | { status: 'progress'; info: string }
  | { status: 'completed' }
  | { status: 'cancelled' }
  | { status: 'failure'; error: string };

export type ClearResult =
  // | { status: 'progress'; info: string }
  | { status: 'completed' }
  // | { status: 'cancelled' }
  | { status: 'failure'; error: string };
