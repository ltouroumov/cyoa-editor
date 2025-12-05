import * as R from 'ramda';
import {
  chain,
  clone,
  concat,
  filter,
  head,
  identity,
  isEmpty,
  isNotEmpty,
  keys,
  map,
  omit,
  partition,
  prop,
  reject,
  startsWith,
} from 'ramda';
import { P, match } from 'ts-pattern';

import { DefaultProject } from '~/composables/project/defaults';
import { V1ProjectSchema } from '~/composables/project/schema/v1-format';
import { V2ProjectSchema } from '~/composables/project/schema/v2-format';
import type {
  ConditionTerm as ConditionTermV1,
  Project as LegacyProject,
} from '~/composables/project/types/v1';
import type { Project } from '~/composables/project/types/v2';
import {
  type AllOfCondition,
  type AnyOfCondition,
  type ConditionTerm,
  isAlwaysTerm,
} from '~/composables/project/types/v2/condition';
import { createId } from '~/composables/project/types/v2/id';
import type {
  ChoiceObject,
  RowObject,
} from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import { ComponentType } from '~/composables/project/types/v2/objects/components/choice';
import {
  ConditionMode,
  ConditionType,
  type ObjectCondition,
} from '~/composables/project/types/v2/objects/components/condition';
import type { LayoutChildProps } from '~/composables/project/types/v2/objects/layout';
import type { EditorProject } from '~/composables/shared/tables/editor_projects';

type ImportResult = { project: Omit<EditorProject, 'id'>; data: Project };

class ImportError extends Error {}

// Base grid is 60 columns to handle multiples of 2, 3, 4, 5, and 6
const ObjectSizeMap: Record<string, number> = {
  'col-12': 60,
  'col-sm-11': 55,
  'col-sm-10': 50,
  'col-sm-9': 45,
  'col-sm-8': 40,
  'col-sm-7': 35,
  'col-sm-6': 30,
  'col-sm-5': 25,
  'col-md-4': 20,
  'col-md-3': 15,
  'w-20': 12,
  'col-lg-2': 10,
  'w-10': 6,
  'col-xl-1': 5,

  // Deprecated sizes, rounded to nearest supported value
  'w-14': 6,
  'w-12': 6,
  'w-11': 6,
  'w-9': 5,
};

function classToWidth(widthClass: string): number {
  return ObjectSizeMap[widthClass];
}

function toConditionTerm(terms: ConditionTermV1[]): ConditionTerm | undefined {
  const AllOf = (terms: ConditionTerm[]): ConditionTerm => ({ allOf: terms });
  const AnyOf = (terms: ConditionTerm[]): ConditionTerm => ({ anyOf: terms });
  const IsSelected = (id: string): ConditionTerm => ({ isSelected: id });
  const IsNotSelected = (id: string): ConditionTerm => ({ isNotSelected: id });

  function buildCondition(term: ConditionTermV1): ConditionTerm {
    // Compute the base condition microcode
    const base = match(term)
      .with({ type: 'id', required: true }, (): ConditionTerm => {
        const ids = R.reject(R.isEmpty, [
          term.reqId,
          term.reqId1,
          term.reqId2,
          term.reqId3,
        ]);
        return AllOf(R.map(IsSelected, ids));
      })
      .with({ type: 'id', required: false }, (): ConditionTerm => {
        const ids = R.reject(R.isEmpty, [
          term.reqId,
          term.reqId1,
          term.reqId2,
          term.reqId3,
        ]);
        return AllOf(R.map(IsNotSelected, ids));
      })
      .with(
        { type: 'or', required: true, orRequired: P.select() },
        (orRequired): ConditionTerm => {
          const ids = R.reject(R.isEmpty, R.map(R.prop('req'), orRequired));
          return AnyOf(R.map(IsSelected, ids));
        },
      )
      .with(
        { type: 'or', required: false, orRequired: P.select() },
        (orRequired): ConditionTerm => {
          const ids = R.reject(R.isEmpty, R.map(R.prop('req'), orRequired));
          return AnyOf(R.map(IsNotSelected, ids));
        },
      )
      .otherwise((): ConditionTerm => ({ always: true }));

    if (isEmpty(term.requireds)) {
      return base;
    } else {
      // Handle sub-conditions
      const inner: ConditionTerm[] = map(buildCondition, term.requireds);
      return AllOf([base, ...inner]);
    }
  }

  function simplify(term: ConditionTerm): ConditionTerm {
    return match(term)
      .with({ allOf: P.select() }, (terms: ConditionTerm[]): ConditionTerm => {
        const [allOfChildren, otherChildren] = partition(
          (term): term is AllOfCondition => 'allOf' in term,
          terms,
        );
        // Flatten all children of the same type into this level
        const flatChildren = chain(prop('allOf'), allOfChildren);
        // Concatenate all children and recursively simplify
        const simplified = map(simplify, concat(flatChildren, otherChildren));
        if (simplified.length === 0) {
          return { always: true };
        } else if (simplified.length === 1) {
          return head(simplified)!;
        } else {
          return AllOf(simplified);
        }
      })
      .with({ anyOf: P.select() }, (terms: ConditionTerm[]): ConditionTerm => {
        const [anyOfChildren, otherChildren] = partition(
          (term): term is AnyOfCondition => 'anyOf' in term,
          terms,
        );
        // Flatten all children of the same type into this level
        const flatChildren = chain(prop('anyOf'), anyOfChildren);
        // Concatenate all children and recursively simplify
        const simplified = map(simplify, concat(flatChildren, otherChildren));
        if (simplified.length === 0) {
          return { always: true };
        } else if (simplified.length === 1) {
          return head(simplified)!;
        } else {
          return AnyOf(simplified);
        }
      })
      .otherwise(identity);
  }

  const simplified = simplify(AllOf(map(buildCondition, terms)));
  if (isAlwaysTerm(simplified)) {
    return undefined;
  } else {
    return simplified;
  }
}

export async function importProject(inputData: any): Promise<ImportResult> {
  if (V1ProjectSchema.isValidSync(inputData)) {
    return convertLegacyProject(inputData as LegacyProject);
  } else if (V2ProjectSchema.isValidSync(inputData)) {
    const project = prop('$project', inputData) as EditorProject;
    const data = omit(['$schema', '$project'], inputData) as Project;
    return { project, data };
  } else {
    throw new ImportError('Invalid Schema');
  }
}

function convertLegacyProject(legacy: LegacyProject): ImportResult {
  const project: Omit<EditorProject, 'id'> = {
    name: legacy.rows[0].title,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const data = clone(DefaultProject);
  data.content.children['@root'] = [{ id: '@default' }];
  data.content.objects['@default'] = {
    id: '@default',
    type: ObjectType.page,
    name: 'Default',
  };

  data.content.children['@default'] = [];
  for (const row of legacy.rows) {
    data.content.children['@default'].push({ id: row.id });
    const rowObject: RowObject = {
      id: row.id,
      type: ObjectType.row,
      name: row.title,
      header: {
        title: row.title,
        text: row.titleText,
      },
      layout: {
        itemAlign: row.rowJustify ?? 'left',
        itemWidth: classToWidth(row.objectWidth),
      },
      requirements: {
        allowedChoices: row.allowedChoices,
        display: toConditionTerm(row.requireds),
      },
    };

    if (row.image) {
      const mediaId = createId('media');
      data.media.images[mediaId] = {
        id: mediaId,
        isRemote: row.imageIsLink,
        data: row.image,
      };

      rowObject.header!.image = mediaId;
    }

    data.content.objects[row.id] = rowObject;
    data.content.children[row.id] = [];
    for (const object of row.objects) {
      let layout: LayoutChildProps | undefined = undefined;
      if (object.objectWidth) {
        layout = { width: classToWidth(object.objectWidth) };
      }

      data.content.children[row.id].push({
        id: object.id,
        layout: layout,
      });
      const choiceObject: ChoiceObject = {
        id: object.id,
        type: ObjectType.choice,
        name: object.title,

        header: {
          title: object.title,
          text: object.text,
          layout: object.template,
        },

        components: {},
      };

      if (isNotEmpty(object.requireds)) {
        const requirements: ObjectCondition[] = [];

        for (const required of object.requireds) {
          requirements.push({
            id: createId(),
            type: required.required
              ? ConditionType.required
              : ConditionType.incompatible,
            mode:
              required.type === 'or' ? ConditionMode.any : ConditionMode.all,
            objectIds: reject(
              isEmpty,
              concat(
                map(
                  (key: string): string =>
                    // This is some obscure typescript magic
                    prop(key as `reqId${number}`, required),
                  filter(startsWith('reqId'), keys(required)),
                ),
                map(prop('req'), required.orRequired),
              ),
            ),
            activeWhen: isNotEmpty(required.requireds)
              ? toConditionTerm(required.requireds)
              : undefined,
            display: required.showRequired,
          });
        }

        choiceObject.components[ComponentType.Requirements] = {
          type: ComponentType.Requirements,
          requirements: requirements,
        };
      }

      if (object.image) {
        const mediaId = createId('media');
        data.media.images[mediaId] = {
          id: mediaId,
          isRemote: object.imageIsLink,
          data: object.image,
        };

        choiceObject.header!.image = mediaId;
      }

      data.content.objects[object.id] = choiceObject;
      data.content.children[object.id] = [];
      for (const addon of object.addons) {
        const addonId = createId(ObjectType.addon);
        data.content.children[object.id].push({ id: addonId });
        data.content.objects[addonId] = {
          id: addonId,
          type: ObjectType.addon,
          name: addon.title,

          header: {
            title: addon.title,
            text: addon.text,
          },

          components: {},
        };
      }
    }
  }

  return { project, data };
}
