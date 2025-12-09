import type { ViewerProject } from '~/composables/viewer/types';

export type ViewerProjectCacheFields = {
  cachedAt: Date;
  origin: 'local' | 'remote';
};
export type ViewerProjectCache = ViewerProject & ViewerProjectCacheFields;
