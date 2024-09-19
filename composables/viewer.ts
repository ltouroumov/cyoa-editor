export type ViewerProject = {
  remoteFileUrl: string;
  title: string;
};

export type ViewerProjectList = {
  items: ViewerProject[];
};

export enum ViewContext {
  Viewer,
  Editor, // Future use case
  BackpackEnabled,
  BackpackDisabled,
}
