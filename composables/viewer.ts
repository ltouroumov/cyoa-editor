export type ViewerProject = {
  remoteFileUrl: string;
  title: string;
};

export type ViewerProjectList = {
  items: ViewerProject[];
};

export enum ViewObject {
  Preview,
  Editor, // Future use case
  AlwaysEnabled,
  AlwaysDisabled,
}
