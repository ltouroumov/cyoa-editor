import * as R from 'ramda';

import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import { type PackRow, useBackpack } from '~/composables/viewer/useBackpack';

type ExportTextOptions = {
  exportHeaders: boolean;
  exportAddons: boolean;
};
type ExportCodeOptions = {
  legacy?: boolean;
};

export function useBackpackExport() {
  const { packRows } = useBackpack();
  const { getObject } = useProjectStore();
  const { selected } = useProjectRefs();

  const formatObject = (obj: ProjectObj, count: number): string => {
    let result = obj.title;
    if (count > 1 || obj.isSelectableMultiple) {
      result += ` x ${count}`;
    }
    return result;
  };

  const createExportText = (options: ExportTextOptions) => {
    return R.pipe(
      R.map(({ packRow, choices }: PackRow): string => {
        const choiceTitles = R.map(({ obj, addons, count }) => {
          let result = formatObject(obj, count);
          if (R.isNotEmpty(addons) && options.exportAddons) {
            const addonTitles = R.map((addon) => addon.title, addons);
            result += ` [${R.join(', ', addonTitles)}]`;
          }
          return result;
        }, choices);

        if (options.exportHeaders) {
          return R.concat(`**${packRow.title}**\n`, R.join(', ', choiceTitles));
        } else {
          return R.join(', ', choiceTitles);
        }
      }),
      R.join(options.exportHeaders ? '\n' : ', '),
    )(packRows.value);
  };

  const createLegacyExportCode = () => {
    return R.pipe(
      R.map(([id, amt]) => {
        const object = getObject(id);
        return amt > 1 || object.isSelectableMultiple ? `${id}/ON#${amt}` : id;
      }),
      R.join(','),
    )(R.toPairs(selected.value));
  };

  const createNewExportCode = () => {
    // TODO: Include build notes
    return R.pipe(
      R.map(([id, amt]) => {
        return amt > 1 ? `${id}:${amt}` : id;
      }),
      R.join(';'),
    )(R.toPairs(selected.value));
  };

  const createExportCode = (options: ExportCodeOptions) => {
    if (options.legacy) {
      return createLegacyExportCode();
    } else {
      return createNewExportCode();
    }
  };

  return { createExportText, createExportCode };
}
