import type {
  ObjStyles,
  ProjectStyles,
  RowStyles,
} from '~/composables/project/types/v1/styles';

type _ArbReqId = {
  // Arbitrary number of reqId properties
  [K in `reqId${number}`]: string;
};

export type ConditionTerm = _ArbReqId & {
  id: string;
  reqId: string;
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

export type ObjAddon = Partial<HasId> &
  HasRequirements & {
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
    activateOtherChoice: boolean;
    activateThisChoice: string;
    deactivateOtherChoice: boolean;
    deactivateThisChoice: string;
    groups: { id: string }[];

    isSelectableMultiple: boolean;
    isNotSelectable: boolean;
    numMultipleTimesMinus: string;
    numMultipleTimesPluss: string;

    addToAllowChoice: boolean;
    numbAddToAllowChoice: number;
    idOfAllowChoice: string;

    isPrivateStyling: boolean;
    styling: ObjStyles;
    template: string;
  };

export type ProjectRow = HasId &
  HasRequirements & {
    title: string;
    titleText?: string;

    image: string;
    imageIsLink: boolean;
    objectWidth: string;
    rowJustify?: 'left' | 'right' | 'center';

    resultGroupId: string;
    allowedChoices: number;
    isInfoRow: boolean;

    objects: ProjectObj[];

    isPrivateStyling: boolean;
    styling?: RowStyles;
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
  $projectId?: string;
  rows: ProjectRow[];
  backpack: ProjectRow[];
  pointTypes: PointType[];
  styling: ProjectStyles;
};

export type ProjectFile = {
  data: Project;
  fileName?: string;
  projectId?: string | number;
  projectName: string;
  projectHash: string;
};

export type EmptyProjectStore = {
  status: 'empty';
};
export type LoadingProjectStore = {
  status: 'loading';
  progress?: string;
};
export type LoadedProjectStore = {
  status: 'loaded';
  file: ProjectFile;
};

export type ProjectStore =
  | EmptyProjectStore
  | LoadingProjectStore
  | LoadedProjectStore;

export type ProjectNote = {
  id: string;
  title: string;
  text: string;
};

export const EMPTY_PROJECT: Project = {
  rows: [],
  backpack: [],
  pointTypes: [],
  styling: {} as ProjectStyles,
};
