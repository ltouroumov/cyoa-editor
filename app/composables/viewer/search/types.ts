import type { Project } from '~/composables/project/types/v1';

export type SearchEvent =
  | { type: 'init'; project: Project }
  | { type: 'search'; query: string; replyTo?: string };

export type WorkerSearchResult =
  | { type: 'object'; rowId: string; objId: string }
  | {
      type: 'addon';
      rowId: string;
      objId: string;
      addonId: string | number;
    };
