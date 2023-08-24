import { useState } from '#imports';

/**
 * {
 *               "afterText": "",
 *               "beforeText": "Incompatible:",
 *               "id": "",
 *               "operator": "",
 *               "orRequired": [
 *                 {
 *                   "req": ""
 *                 },
 *                 {
 *                   "req": ""
 *                 },
 *                 {
 *                   "req": ""
 *                 },
 *                 {
 *                   "req": ""
 *                 }
 *               ],
 *               "reqId": "nyan",
 *               "reqId1": "",
 *               "reqId2": "",
 *               "reqId3": "",
 *               "reqPoints": 0,
 *               "required": false,
 *               "requireds": [],
 *               "showRequired": true,
 *               "type": "id"
 *             }
 */
export type Condition = {
  reqId: string;
  reqId1: string;
  reqId2: string;
  reqId3: string;
  required: boolean;
  type: 'id';
}

export type HasConditions = {
  requireds: Condition[];
}

export type ProjectObj = HasConditions & {
  id: string;
  title: string;
  text: string;
  image: string;
  imageIsLink: boolean;
  objectWidth?: string;
}

export type ProjectRow = HasConditions & {
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