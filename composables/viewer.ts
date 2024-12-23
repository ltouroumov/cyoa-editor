export type ViewerProject = {
  id: string;
  title: string;
  author?: string;
  preview?: string;
  remoteFileUrl: string;
};

export type ViewerProjectList = {
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
