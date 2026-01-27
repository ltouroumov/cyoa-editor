import type { CacheItem } from '~/composables/shared/tables/viewer_projects';
import type { ViewerProject } from '~/composables/viewer/types';

export type CacheOptions = {
  refresh?: boolean;
  project?: boolean;
  images?: boolean | string[];
};

export type ClearOptions = {
  project?: boolean;
  images?: boolean | string[];
};

export type CacheTask = {
  type: 'cache';
  project: ViewerProject;
  options: CacheOptions;
  baseUrl: string;
};

export type ClearTask = {
  type: 'clear';
  project: ViewerProject;
  options: ClearOptions;
  baseUrl: string;
};

export type CacheEvent =
  | { type: 'init' }
  | { type: 'abort'; taskId: string }
  | (CacheTask & { taskId: string })
  | (ClearTask & { taskId: string });

export type CacheResult =
  | { taskId: string; status: 'progress'; info: string }
  | { taskId: string; status: 'completed'; cachedItems?: CacheItem[] }
  | { taskId: string; status: 'cancelled'; cachedItems?: CacheItem[] }
  | { taskId: string; status: 'failure'; error: string };

export type ClearResult =
  | { taskId: string; status: 'progress'; info: string }
  | {
      taskId: string;
      status: 'completed';
      deletedProject?: boolean;
      deletedAllImages?: boolean;
      deletedCacheItems?: string[];
    }
  // | { status: 'cancelled' }
  | { taskId: string; status: 'failure'; error: string };
