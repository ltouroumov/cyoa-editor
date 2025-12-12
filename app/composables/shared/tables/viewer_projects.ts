import type { ViewerProject } from '~/composables/viewer/types';

export type CacheItem =
  | { type: 'images.all' }
  | { type: 'images.row'; rowId: string; count: number };

export type ViewerProjectCacheFields = {
  cachedAt: Date;
  cachedItems?: CacheItem[];
  origin: 'local' | 'remote';
};
export type ViewerProjectCache = ViewerProject & ViewerProjectCacheFields;
