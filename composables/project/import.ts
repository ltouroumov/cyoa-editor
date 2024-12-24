import { clone, omit, prop } from 'ramda';

import { DefaultProject } from '~/composables/project/defaults';
import { V1ProjectSchema } from '~/composables/project/schema/v1-format';
import { V2ProjectSchema } from '~/composables/project/schema/v2-format';
import type { Project as LegacyProject } from '~/composables/project/types/v1';
import type { Project } from '~/composables/project/types/v2';
import { createId } from '~/composables/project/types/v2/id';
import type {
  ChoiceObject,
  RowObject,
} from '~/composables/project/types/v2/objects';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import type { LayoutChildProps } from '~/composables/project/types/v2/objects/layout';
import type { EditorProject } from '~/composables/shared/tables/projects';

type ImportResult = { project: Omit<EditorProject, 'id'>; data: Project };

class ImportError extends Error {}

const ObjectSizeMap: Record<string, number> = {
  'col-12': 12,
  'col-sm-11': 11,
  'col-sm-10': 10,
  'col-sm-9': 9,
  'col-sm-8': 8,
  'col-sm-7': 7,
  'col-sm-6': 6,
  'col-sm-5': 5,
  'col-md-4': 4,
  'col-md-3': 3,
  'w-20': 2, // Actually 20% or 2.4 columns
  'col-lg-2': 2,
  'w-14': 1,
  'w-12': 1,
  'w-11': 1,
  'w-10': 1,
  'w-9': 1,
  'col-xl-1': 1,
};

function classToWidth(widthClass: string): number {
  return ObjectSizeMap[widthClass];
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
        defaultWidth: classToWidth(row.objectWidth),
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
