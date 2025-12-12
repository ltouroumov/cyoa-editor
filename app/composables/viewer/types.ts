import type { ViewerProjectCacheFields } from '~/composables/shared/tables/viewer_projects';

export type ViewerProject = {
  file_url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  author?: string;
  id: string;
};

export type LibrarySettings = {
  remote?: string;
  remotes?: string[];
  default: string | null;
  show_load_file: boolean;
  show_project_sidebar: boolean;
};

export type LibraryData = LibrarySettings & {
  items: ViewerProject[];
};

export type ProjectListEntry = ViewerProject &
  Partial<ViewerProjectCacheFields> & {
    source: 'local' | 'remote' | 'cached';
  };
