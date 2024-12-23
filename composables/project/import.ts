import { clone, omit, prop } from 'ramda';

import { DefaultProject } from '~/composables/project/defaults';
import { V1ProjectSchema } from '~/composables/project/schema/v1-format';
import { V2ProjectSchema } from '~/composables/project/schema/v2-format';
import type { Project as LegacyProject } from '~/composables/project/types/v1';
import type { Project } from '~/composables/project/types/v2';
import { createId } from '~/composables/project/types/v2/id';
import { ObjectType } from '~/composables/project/types/v2/objects/base';
import type { EditorProject } from '~/composables/shared/tables/projects';

type ImportResult = { project: Omit<EditorProject, 'id'>; data: Project };

class ImportError extends Error {}

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
  data.content.entries['@default'] = {
    id: '@default',
    type: ObjectType.page,
    name: 'Default',
  };

  for (const row of legacy.rows) {
    data.content.entries[row.id] = {
      id: row.id,
      type: ObjectType.row,
      name: row.title,
      header: {
        title: row.title,
        text: row.titleText,
      },
    };

    if (row.image) {
      const mediaId = createId('media');
      data.media.images[mediaId] = {
        id: mediaId,
        isRemote: row.imageIsLink,
        data: row.image,
      };
    }

    data.content.children[row.id] = [];
    for (const object of row.objects) {
      data.content.children[row.id].push(object.id);
      data.content.entries[object.id] = {
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
      }

      data.content.children[object.id] = [];
      for (const addon of object.addons) {
        const addonId = createId(ObjectType.addon);
        data.content.children[object.id].push(addonId);
        data.content.entries[addonId] = {
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
