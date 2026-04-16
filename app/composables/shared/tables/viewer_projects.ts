import type { ViewerProject } from '~/composables/viewer/types';

export type CacheItem = {
  type: 'images.row';
  rowId: string;
  count: number;
  size: number;
};

export type ViewerProjectCacheFields = {
  cachedAt: Date;
  cachedItems?: CacheItem[];
  origin: 'local' | 'remote';
};
export type ViewerProjectCache = ViewerProject & ViewerProjectCacheFields;
