import type { CacheItem } from '~/composables/shared/tables/viewer_projects';
import type { ViewerProject } from '~/composables/viewer/types';

export type CacheOptions = {
  refresh?: boolean;
  project?: boolean;
  images?: boolean | string[];
};

export type CacheTask = {
  type: 'cache';
  project: ViewerProject;
  options: CacheOptions;
};

export type ClearTask = {
  type: 'clear';
  project: ViewerProject;
};

export type CacheEvent =
  | { type: 'init' }
  | { type: 'abort'; taskId: string }
  | (CacheTask & { taskId: string })
  | (ClearTask & { taskId: string });

export type CacheResult =
  | { taskId: string; status: 'progress'; info: string }
  | { taskId: string; status: 'completed'; cachedItems?: CacheItem[] }
  | { taskId: string; status: 'cancelled' }
  | { taskId: string; status: 'failure'; error: string };

export type ClearResult =
  // | { status: 'progress'; info: string }
  | { taskId: string; status: 'completed' }
  // | { status: 'cancelled' }
  | { taskId: string; status: 'failure'; error: string };
