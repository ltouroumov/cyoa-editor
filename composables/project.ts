import { useState } from '#imports';

export type ProjectObj = {
  id: string;
  title: string;
  text: string;
  image: string;
  imageIsLink: boolean;
  objectWidth?: string;
}

export type ProjectRow = {
  id: string;
  title: string;
  titleText?: string;

  image: string;
  imageIsLink: boolean;
  objectWidth: string;

  objects: ProjectObj[];
}

export type Project = {
  rows: ProjectRow[];
}

export type ProjectFile = {
  project: Project;
  file: string;
}

export const useProjectFile = () => useState<ProjectFile | undefined>('project');
export const useProject = () => computed(() => useProjectFile().value?.project);
export const unloadProject = () => {
  const project = useProjectFile();
  project.value = undefined;
}