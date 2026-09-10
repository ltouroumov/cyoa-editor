import type {
  ObjStyles,
  ProjectStyles,
  RowStyles,
} from '~/composables/project/types/v1/styles';

export type _ArbReqId = {
  // Arbitrary number of reqId properties
  [K in `reqId${number}`]: string;
};

export type ConditionTerm = _ArbReqId & {
  id: string;
  reqId: string;
  reqPoints?: number;
  operator?: number;
  orRequired: { req: string }[];
  required: boolean;
  showRequired: boolean;
  type: 'id' | 'or' | 'points' | 'pointCompare';

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

export type HasImage = {
  image: string;
  imageIsUrl: boolean;
  imageLink: string;
};

export type Score = {
  id: string;
  value: string;
  beforeText: string;
  afterText: string;
  requireds: ConditionTerm[];
};

export type ObjAddon = {
  id?: string;
  title: string;
  text: string;
  image: string;
  imageIsUrl: boolean;
  imageLink: string;
  requireds: ConditionTerm[];
};

export type ProjectObj = {
  id: string;
  requireds: ConditionTerm[];
  image: string;
  imageIsUrl: boolean;
  imageLink: string;
  title: string;
  text: string;
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
  isVisible: boolean;
  isImageUpload: boolean;
  numMultipleTimesMinus: number | string;
  numMultipleTimesPluss: number | string;
  multipleUseVariable: number;
  multipleScoreId: string;

  addToAllowChoice: boolean;
  numbAddToAllowChoice: number;
  idOfAllowChoice: string;

  isPrivateStyling: boolean;
  styling: ObjStyles | null;
  template: number;
};

export type ProjectRow = {
  id: string;
  requireds: ConditionTerm[];
  image: string;
  imageIsUrl: boolean;
  imageLink: string;
  title: string;
  titleText?: string;

  objectWidth: string;
  rowJustify?: 'left' | 'right' | 'center';

  resultGroupId: string;
  allowedChoices: number;
  isInfoRow: boolean;
  isButtonRow: boolean;
  isResultRow: boolean;

  objects: ProjectObj[];

  isPrivateStyling: boolean;
  styling?: RowStyles;
};

export type PointType = {
  id: string;
  name: string;
  startingSum: number;
  activatedId: string;
  afterText: string;
  beforeText: string;
  belowZeroNotAllowed?: boolean;
  plussOrMinusAdded?: boolean;
  plussOrMinusInverted?: boolean;
  iconHeight?: string;
  iconWidth?: string;
  iconIsOn?: boolean;
  image?: string;
  imageOnSide?: boolean;
  imageSidePlacement?: boolean;
  initValue?: number;
};

export type RowGroup = {
  id: string;
  name: string;
  elements: string[];
};

export type Variable = {
  id: string;
  isTrue: boolean;
};

export type Project = {
  $projectId?: string;
  backpack: ProjectRow[];
  groups: RowGroup[];
  pointTypes: PointType[];
  rows: ProjectRow[];
  styling: ProjectStyles;
  variables: Variable[];
};

export type ProjectFile = {
  data: Project;
  fileName?: string;
  projectId?: string;
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
  local: boolean;
  origin?: 'local' | 'remote';
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
  variables: [],
  groups: [],
};
