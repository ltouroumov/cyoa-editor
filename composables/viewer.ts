export type ViewerProject = {
  remoteFileUrl: string;
  title: string;
  id: string;
};

export type ViewerProjectList = {
  items: ViewerProject[];
  default: string | null;
};

export enum ViewContext {
  Viewer,
  Editor, // Future use case
  BackpackEnabled,
  BackpackDisabled,
}
