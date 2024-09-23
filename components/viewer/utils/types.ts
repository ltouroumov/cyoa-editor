export type SavedBuildProject = {
  projectId?: string;
  name: string;
  hash: string;
};
export type SavedBuildItem = {
  objId: string;
  count: number;
  title: string;
};
export type SavedBuildGroup = {
  rowId: string;
  title: string;
  items: SavedBuildItem[];
};
export type SavedBuildData = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  project: SavedBuildProject;
  groups: SavedBuildGroup[];
};

export enum ProjectMatch {
  None,
  Hash,
  Name,
}
