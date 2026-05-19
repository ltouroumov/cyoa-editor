import type { Project } from '~/composables/project/types/v2';

export interface EditorProject {
  id: number;
  name: string;
  tags: string[];
  currentVersion: number;
  currentVersionId?: number;

  createdAt: Date;
  updatedAt: Date;

  deleted?: boolean;
}

export interface EditorProjectVersion {
  id: number;
  projectId: number;

  data: Project;
  createdAt: Date;
  updatedAt?: Date;
  version?: number;
}
