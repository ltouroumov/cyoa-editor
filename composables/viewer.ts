export type ViewerProject = {
  remoteFileUrl: string;
  title: string;
  id: string;
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
