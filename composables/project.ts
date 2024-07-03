export type AddonStyles = {
  addonTitle: string;
  addonText: string;
};

export type ObjStyles = {
  objectTitle: string;
  objectText: string;

  objectTitleColor: string;
  objectTextColor: string;

  objectBgColorIsOn: boolean;
  objectBgColor: string;

  objectBorderIsOn: boolean;
  objectBorderColor: string;
  objectBorderStyle: string;
  objectBorderWidth: number;
  objectBorderRadiusTopLeft: string;
  objectBorderRadiusTopRight: string;
  objectBorderRadiusBottomRight: string;
  objectBorderRadiusBottomLeft: string;
  objectBorderRadiusIsPixels: boolean;

  selBgColorIsOn: boolean;
  selFilterBgColor: string;

  reqBgColorIsOn: boolean;
  reqFilterBgColor: string;
};

export type RowStyles = ObjStyles &
  AddonStyles & {
    rowTitle: string;
    rowText: string;
    rowTitleColor: string;
    rowTextColor: string;
    rowBgColor: string;
    rowBgColorIsOn: boolean;
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

    isSelectableMultiple: boolean;
    isNotSelectable: boolean;
    numMultipleTimesMinus: string;
    numMultipleTimesPluss: string;

    isPrivateStyling: boolean;
    styling: ObjStyles;
  };

export type ProjectRow = HasId &
  HasRequirements & {
    title: string;
    titleText?: string;

    image: string;
    imageIsLink: boolean;
    objectWidth: string;

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
  rows: ProjectRow[];
  backpack: ProjectRow[];
  pointTypes: PointType[];
  styling: ProjectStyles;
};

export type ProjectFile = {
  data: Project;
  file: string;
};
