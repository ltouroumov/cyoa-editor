type TextAlignT = 'left' | 'center' | 'right';

export type ScoreStyles = {
  scoreText: string;
  scoreTextAlign: TextAlignT;
  scoreTextColor: string;
  scoreTextSize: number;
};

export type AddonStyles = {
  addonText: string;
  addonTextAlign: TextAlignT;
  addonTextColor: string;
  addonTextTextSize: number;
  addonTitle: string;
  addonTitleAlign: TextAlignT;
  addonTitleColor: string;
  addonTitleTextSize: number;
};

export type ObjStyles = ScoreStyles & {
  objectTitle: string;
  objectTitleTextSize: 200;
  objectTitleColor: string;
  objectTitleAlign: TextAlignT;

  objectText: string;
  objectTextTextSize: 100;
  objectTextAlign: TextAlignT;
  objectTextColor: string;
  objectTextPadding: 10;

  objectImageWidth: number;
  objectImageMarginTop: number;
  objectImageMarginBottom: number;

  objectBgColorIsOn: boolean;
  objectBgColor: string;
  objectBackgroundImage: string;

  objectBorderIsOn: boolean;
  objectBorderColor: string;
  objectBorderStyle: string;
  objectBorderWidth: number;
  objectBorderRadiusTopLeft: string | number;
  objectBorderRadiusTopRight: string | number;
  objectBorderRadiusBottomRight: string | number;
  objectBorderRadiusBottomLeft: string | number;
  objectBorderRadiusIsPixels: boolean;

  objectImgBorderColor: string;
  objectImgBorderIsOn: boolean;
  objectImgFillIsOn: boolean;
  objectImgObjectFillStyle: string;
  objectImgObjectFillHeight: string;
  objectImgOverflowIsOn: boolean;

  objectMargin: number;
  objectHeight: boolean;
  objectOverflowIsOn: boolean;

  selBgColorIsOn: boolean;
  selFilterBgColor: string;

  reqBgColorIsOn: boolean;
  reqFilterBgColor: string;
};

export type RowStyles = ObjStyles &
  AddonStyles & {
    rowTitle: string;
    rowTitleColor: string;
    rowTitleAlign: TextAlignT;
    rowTitleTextSize: number;

    rowText: string;
    rowTextColor: string;
    rowTextAlign: TextAlignT;
    rowTextPaddingX: number;
    rowTextPaddingY: number;
    rowTextTextSize: number;

    rowBgColor: string;
    rowBgColorIsOn: boolean;
    rowBackgroundImage: string;

    rowBodyMarginBottom: number | string;
    rowBodyMarginSides: number | string;
    rowBodyMarginTop: number | string;

    rowBorderColor: string;
    rowBorderIsOn: boolean;
    rowBorderStyle: string;
    rowBorderWidth: number;
    rowOverFlowIsOn: boolean;
    rowBorderRadiusTopLeft: string | number;
    rowBorderRadiusTopRight: string | number;
    rowBorderRadiusBottomRight: string | number;
    rowBorderRadiusBottomLeft: string | number;
    rowBorderRadiusIsPixels: boolean;

    rowImageMarginTop: number;
    rowImageMarginBottom: number;
    rowImageWidth: number;
    rowImgBorderColor: string;
    rowImgBorderIsOn: boolean;
    rowImgBorderStyle: string;
    rowImgBorderWidth: number;
    rowImgOverflowIsOn: boolean;

    rowMargin: number;
  };

export type BarStyles = {
  barTextFont: string;
};

export type ProjectStyles = RowStyles &
  BarStyles & {
    backgroundColor: string;
  };

export type ConditionTerm = {
  id: string;
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
    rowJustify: 'left' | 'right' | 'center';

    resultGroupId: string;
    allowedChoices: number;
    isInfoRow: boolean;

    objects: ProjectObj[];

    isPrivateStyling: boolean;
    styling: RowStyles;
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
