export type ViewerProject = {
  file_url: string;
  thumbnail_url?: string;
  title: string;
  description?: string;
  author?: string;
  id: string;
};

export type ViewerProjectList = {
  remote?: string;
  items: ViewerProject[];
  default: string | null;
  show_load_file: boolean;
  show_project_sidebar: boolean;
};

export enum ViewContext {
  Viewer,
  Editor, // Future use case
  BackpackEnabled,
  BackpackDisabled,
}
