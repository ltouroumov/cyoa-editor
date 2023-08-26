export type ConditionTerm = {
  reqId: string;
  reqId1: string;
  reqId2: string;
  reqId3: string;
  orRequired: { req: string }[];
  required: boolean;
  showRequired: boolean;
  type: 'id' | 'or';

  requireds: ConditionTerm[];

  beforeText: string;
  afterText: string;
};

export type HasRequirements = {
  requireds: ConditionTerm[];
};

export type HasId = {
  id: string;
};

export type Score = HasRequirements & {
  id: string;
  value: string;
  beforeText: string;
  afterText: string;
};

export type ObjAddon = HasRequirements & {
  title: string;
  text: string;
};

export type ProjectObj = HasId &
  HasRequirements & {
    title: string;
    text: string;
    image: string;
    imageIsLink: boolean;
    objectWidth?: string;
    scores: Score[];
    addons: ObjAddon[];
  };

export type ProjectRow = HasId &
  HasRequirements & {
    title: string;
    titleText?: string;

    image: string;
    imageIsLink: boolean;
    objectWidth: string;

    resultGroupId: string;

    objects: ProjectObj[];
  };

export type PointType = {
  id: string;
  name: string;
  beforeText: string;
  afterText: string;
  startingSum: number;
  activatedId: string;
};

export type Project = {
  rows: ProjectRow[];
  backpack: ProjectRow[];
  pointTypes: PointType[];
};

export type ProjectFile = {
  data: Project;
  file: string;
};
