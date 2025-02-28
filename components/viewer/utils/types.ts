import type { ProjectNote } from '~/composables/project';
import type { Selections } from '~/composables/store/project';

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
  selected?: Selections;
  notes?: Record<string, ProjectNote>;
  // 0 means root
  folder: number;
};
export type SavedBuildFolder = {
  id: number;
  name: string;
  // 0 means root
  parent: number;
};

export enum ProjectMatch {
  None,
  Hash,
  Name,
}
