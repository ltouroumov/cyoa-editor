import type { ViewerProject } from '~/composables/viewer/types';

export type ViewerProjectCacheFields = {
  cachedAt: Date;
};
export type ViewerProjectCache = ViewerProject & ViewerProjectCacheFields;
