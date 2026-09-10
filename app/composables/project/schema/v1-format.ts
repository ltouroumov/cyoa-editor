import { z } from 'zod';

import type {
  ConditionTerm,
  HasImage,
  HasRequirements,
  ObjAddon,
  PointType,
  Project,
  ProjectObj,
  ProjectRow,
  RowGroup,
  Score,
  Variable,
} from '~/composables/project/types/v1';
import type {
  AddonStyles,
  BarStyles,
  ObjStyles,
  ProjectStyles,
  RowStyles,
  ScoreStyles,
} from '~/composables/project/types/v1/styles';

// --- Leaf/Base Types ---

const TextAlignSchema = z.enum(['left', 'center', 'right']);

const PointTypeSchema = z.toZod<PointType>()(
  z.object({
    id: z.string(),
    name: z.string(),
    startingSum: z.number(),
    activatedId: z.string(),
    afterText: z.string(),
    beforeText: z.string(),
    belowZeroNotAllowed: z.boolean().optional(),
    plussOrMinusAdded: z.boolean().optional(),
    plussOrMinusInverted: z.boolean().optional(),
    iconHeight: z.string().optional(),
    iconWidth: z.string().optional(),
    iconIsOn: z.boolean().optional(),
    image: z.string().optional(),
    imageOnSide: z.boolean().optional(),
    imageSidePlacement: z.boolean().optional(),
    initValue: z.number().optional(),
  }),
);

const RowGroupSchema = z.toZod<RowGroup>()(
  z.object({
    id: z.string(),
    name: z.string(),
    elements: z.array(z.string()),
  }),
);

const VariableSchema = z.toZod<Variable>()(
  z.object({
    id: z.string(),
    isTrue: z.boolean(),
  }),
);

// --- Styles ---

const ScoreStylesSchema = z.toZod<ScoreStyles>()(
  z.object({
    scoreText: z.string(),
    scoreTextAlign: TextAlignSchema,
    scoreTextColor: z.string(),
    scoreTextSize: z.number(),
  }),
);

const AddonStylesSchema = z.toZod<AddonStyles>()(
  z.object({
    addonText: z.string(),
    addonTextAlign: TextAlignSchema,
    addonTextColor: z.string(),
    addonTextTextSize: z.number(),
    addonTitle: z.string(),
    addonTitleAlign: TextAlignSchema,
    addonTitleColor: z.string(),
    addonTitleTextSize: z.number(),
  }),
);

const ObjStylesSchema = z.toZod<ObjStyles>()(
  z.intersection(
    z.intersection(ScoreStylesSchema, AddonStylesSchema),
    z.object({
      objectTitle: z.string(),
      objectTitleTextSize: z.number(),
      objectTitleColor: z.string(),
      objectTitleAlign: TextAlignSchema,
      objectText: z.string(),
      objectTextTextSize: z.number(),
      objectTextAlign: TextAlignSchema,
      objectTextColor: z.string(),
      objectTextPadding: z.number(),
      objectImageWidth: z.number(),
      objectImageMarginTop: z.number(),
      objectImageMarginBottom: z.number(),
      objectBgColorIsOn: z.boolean(),
      objectBgColor: z.string(),
      objectBackgroundImage: z.string(),
      objectBorderIsOn: z.boolean(),
      objectBorderColor: z.string(),
      objectBorderStyle: z.string(),
      objectBorderWidth: z.number(),
      objectBorderRadiusTopLeft: z.union([z.string(), z.number()]),
      objectBorderRadiusTopRight: z.union([z.string(), z.number()]),
      objectBorderRadiusBottomRight: z.union([z.string(), z.number()]),
      objectBorderRadiusBottomLeft: z.union([z.string(), z.number()]),
      objectBorderRadiusIsPixels: z.boolean(),
      objectImgBorderColor: z.string(),
      objectImgBorderIsOn: z.boolean(),
      objectImgFillIsOn: z.boolean(),
      objectImgObjectFillStyle: z.string(),
      objectImgObjectFillHeight: z.string(),
      objectImgOverflowIsOn: z.boolean(),
      objectMargin: z.number(),
      objectHeight: z.boolean(),
      objectOverflowIsOn: z.boolean(),
      selBgColorIsOn: z.boolean(),
      selFilterBgColor: z.string(),
      reqBgColorIsOn: z.boolean(),
      reqFilterBgColor: z.string(),
    }),
  ),
);

const RowStylesSchema = z.toZod<RowStyles>()(
  z.intersection(
    z.intersection(ObjStylesSchema, AddonStylesSchema),
    z.object({
      rowTitle: z.string(),
      rowTitleColor: z.string(),
      rowTitleAlign: TextAlignSchema,
      rowTitleTextSize: z.number(),
      rowText: z.string(),
      rowTextColor: z.string(),
      rowTextAlign: TextAlignSchema,
      rowTextPaddingX: z.number(),
      rowTextPaddingY: z.number(),
      rowTextTextSize: z.number(),
      rowBgColor: z.string(),
      rowBgColorIsOn: z.boolean(),
      rowBackgroundImage: z.string(),
      rowBodyMarginBottom: z.union([z.number(), z.string()]),
      rowBodyMarginSides: z.union([z.number(), z.string()]),
      rowBodyMarginTop: z.union([z.number(), z.string()]),
      rowBorderColor: z.string(),
      rowBorderIsOn: z.boolean(),
      rowBorderStyle: z.string(),
      rowBorderWidth: z.number(),
      rowOverFlowIsOn: z.boolean(),
      rowBorderRadiusTopLeft: z.union([z.string(), z.number()]),
      rowBorderRadiusTopRight: z.union([z.string(), z.number()]),
      rowBorderRadiusBottomRight: z.union([z.string(), z.number()]),
      rowBorderRadiusBottomLeft: z.union([z.string(), z.number()]),
      rowBorderRadiusIsPixels: z.boolean(),
      rowImageMarginTop: z.number(),
      rowImageMarginBottom: z.number(),
      rowImageWidth: z.number(),
      rowImgBorderColor: z.string(),
      rowImgBorderIsOn: z.boolean(),
      rowImgBorderStyle: z.string(),
      rowImgBorderWidth: z.number(),
      rowImgOverflowIsOn: z.boolean(),
      rowMargin: z.number(),
    }),
  ),
);

const BarStylesSchema = z.toZod<BarStyles>()(
  z.object({
    barTextFont: z.string(),
  }),
);

const ProjectStylesSchema = z.toZod<ProjectStyles>()(
  z.intersection(
    z.intersection(RowStylesSchema, BarStylesSchema),
    z.object({
      backgroundColor: z.string(),
    }),
  ),
);

// --- Recursive / Complex Objects ---

// ConditionTerm is recursive (`requireds` holds nested terms), so the `requireds`
// field is declared through a getter that references this schema.
//
// The `_ArbReqId` part of the type (`{ [K in `reqId${number}`]: string }`) is
// matched by intersecting the fixed shape with a record keyed on the
// `reqId${number}` template literal: MeanDelay condition objects carry an
// arbitrary number of `reqId1`, `reqId2`, ... string keys alongside the fixed
// fields. `z.infer` of this intersection is `{ ...fixed } & Record<`reqId${number}`, string>`,
// which is structurally identical to `ConditionTerm` (unlike `.catchall(z.string())`,
// whose inferred `[k: string]: string` index signature only satisfies `z.toZod`
// at the direct call site, not when the schema is nested in `z.array(...)`).
// At runtime the object half strips unrelated extra keys while the record half
// validates every `reqIdN` value as a string.
const ConditionTermSchema = z.toZod<ConditionTerm>()(
  z.intersection(
    z.object({
      id: z.string(),
      reqId: z.string(),
      reqPoints: z.number().optional(),
      operator: z.number().optional(),
      orRequired: z.array(z.object({ req: z.string() })),
      required: z.boolean(),
      showRequired: z.boolean(),
      type: z.enum(['id', 'or', 'points', 'pointCompare']),
      get requireds(): z.ZodType<ConditionTerm[]> {
        return z.array(ConditionTermSchema);
      },
      beforeText: z.string(),
      afterText: z.string(),
    }),
    z.record(z.templateLiteral(['reqId', z.number()]), z.string()),
  ),
);

const HasRequirementsSchema = z.toZod<HasRequirements>()(
  z.object({
    requireds: z.array(ConditionTermSchema),
  }),
);

const HasImageSchema = z.toZod<HasImage>()(
  z.object({
    image: z.string(),
    imageIsUrl: z.boolean(),
    imageLink: z.string(),
  }),
);

const ScoreSchema = z.toZod<Score>()(
  z.object({
    ...HasRequirementsSchema.shape,
    id: z.string(),
    value: z.string(),
    beforeText: z.string(),
    afterText: z.string(),
  }),
);

const ObjAddonSchema = z.toZod<ObjAddon>()(
  z.object({
    ...HasRequirementsSchema.shape,
    ...HasImageSchema.shape,
    id: z.string().optional(),
    title: z.string(),
    text: z.string(),
  }),
);

const ProjectObjSchema = z.toZod<ProjectObj>()(
  z.object({
    ...HasRequirementsSchema.shape,
    ...HasImageSchema.shape,
    id: z.string(),
    title: z.string(),
    text: z.string(),
    objectWidth: z.string().optional(),
    scores: z.array(ScoreSchema),
    addons: z.array(ObjAddonSchema),
    activateOtherChoice: z.boolean(),
    activateThisChoice: z.string(),
    deactivateOtherChoice: z.boolean(),
    deactivateThisChoice: z.string(),
    cleanACtivatedOnSelect: z.boolean(),
    groups: z.array(z.object({ id: z.string() })),
    multiplyPointtypeIsOn: z.boolean(),
    multiplyPointtypeIsId: z.boolean(),
    pointTypeToMultiply: z.string(),
    multiplyWithThis: z.union([z.number(), z.string()]),
    dividePointtypeIsOn: z.boolean(),
    pointTypeToDivide: z.string(),
    divideWithThis: z.union([z.number(), z.string()]),
    isSelectableMultiple: z.boolean(),
    isNotSelectable: z.boolean(),
    isVisible: z.boolean(),
    isImageUpload: z.boolean(),
    numMultipleTimesMinus: z.union([z.number(), z.string()]),
    numMultipleTimesPluss: z.union([z.number(), z.string()]),
    multipleUseVariable: z.number(),
    multipleScoreId: z.string(),
    addToAllowChoice: z.boolean(),
    numbAddToAllowChoice: z.number(),
    idOfAllowChoice: z.string(),
    isPrivateStyling: z.boolean(),
    styling: z.union([ObjStylesSchema, z.null()]),
    template: z.number(),
  }),
);

const ProjectRowSchema = z.toZod<ProjectRow>()(
  z.object({
    ...HasRequirementsSchema.shape,
    ...HasImageSchema.shape,
    id: z.string(),
    title: z.string(),
    titleText: z.string().optional(),
    objectWidth: z.string(),
    rowJustify: z.enum(['left', 'right', 'center']).optional(),
    resultGroupId: z.string(),
    allowedChoices: z.number(),
    isInfoRow: z.boolean(),
    isButtonRow: z.boolean(),
    isResultRow: z.boolean(),
    objects: z.array(ProjectObjSchema),
    isPrivateStyling: z.boolean(),
    styling: RowStylesSchema.optional(),
  }),
);

// --- Project ---

export const V1ProjectSchema = z.toZod<Project>()(
  z.object({
    $projectId: z.string().optional(),
    backpack: z.array(ProjectRowSchema),
    groups: z.array(RowGroupSchema),
    pointTypes: z.array(PointTypeSchema),
    rows: z.array(ProjectRowSchema),
    styling: ProjectStylesSchema,
    variables: z.array(VariableSchema),
  }),
);
