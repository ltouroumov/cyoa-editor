import { useState } from '#imports';

export type ConditionTerm = {
  reqId: string;
  reqId1: string;
  reqId2: string;
  reqId3: string;
  orRequired: { req: string }[];
  required: boolean;
  showRequired: boolean;
  type: 'id' | 'or';

  beforeText: string;
  afterText: string;
}

/*
  {
    "afterText": "CP",
    "beforeText": "Cost:",
    "id": "2b",
    "requireds": [],
    "showScore": true,
    "type": "",
    "value": "5"
  }
 */
export type Score = {
  id: string;
  value: string;
  beforeText: string;
  afterText: string;
  requireds: ConditionTerm[];
}

export type HasConditions = {
  requireds: ConditionTerm[];
}

export type ProjectObj = HasConditions & {
  id: string;
  title: string;
  text: string;
  image: string;
  imageIsLink: boolean;
  objectWidth?: string;
  scores: Score[];
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
  data: Project;
  file: string;
}
