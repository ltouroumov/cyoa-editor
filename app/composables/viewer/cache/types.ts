import type { ViewerProject } from '~/composables/viewer/types';

export type CacheOptions = {
  refresh?: boolean;
  project?: boolean;
  images?: boolean | string[];
};

export type CacheEvent =
  | { type: 'init' }
  | {
      type: 'cache';
      taskId: string;
      project: ViewerProject;
      options: CacheOptions;
    }
  | { type: 'clear'; taskId: string; project: ViewerProject }
  | { type: 'abort'; taskId: string };

export type CacheResult =
  | { taskId: string; status: 'progress'; info: string }
  | { taskId: string; status: 'completed' }
  | { taskId: string; status: 'cancelled' }
  | { taskId: string; status: 'failure'; error: string };

export type ClearResult =
  // | { status: 'progress'; info: string }
  | { status: 'completed' }
  // | { status: 'cancelled' }
  | { status: 'failure'; error: string };
