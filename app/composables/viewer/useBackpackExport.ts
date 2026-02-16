import { Base64 } from 'js-base64';
import * as R from 'ramda';
import { isNotEmpty } from 'ramda';

import type { ProjectNote, ProjectObj } from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import {
  type PackRow,
  type PackRowChoice,
  useBackpack,
} from '~/composables/viewer/useBackpack';

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
  const { selected, buildNotes } = useProjectRefs();

  const formatObject = (obj: ProjectObj, count: number): string => {
    let result = obj.title;
    if (count > 1 || obj.isSelectableMultiple) {
      result += ` x ${count}`;
    }
    return result;
  };

  const createExportText = (options: ExportTextOptions) => {
    let result = R.pipe(
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

    if (isNotEmpty(buildNotes.value)) {
      const notes = buildNotes.value;
      const rowNotes = R.pipe(
        R.map(({ packRow, choices }: PackRow) => {
          const choiceNotes = R.pipe(
            R.map(({ obj, count }: PackRowChoice) => {
              if (R.has(`obj:${obj.id}`, notes)) {
                const objNotes = notes[`obj:${obj.id}`];
                if (R.includes('\n', objNotes.text)) {
                  return `${obj.title}:\n${objNotes.text.trim()}`;
                } else {
                  return `${obj.title}: ${objNotes.text.trim()}`;
                }
              }
              return null;
            }),
            R.filter(R.isNotNil),
            R.join('\n'),
          )(choices);
          if (R.has(`row:${packRow.id}`, notes)) {
            const rowNotes = notes[`row:${packRow.id}`];
            return `**${packRow.title}**\n${rowNotes.text.trim()}\n${choiceNotes}`;
          } else if (R.isNotEmpty(choiceNotes)) {
            return `**${packRow.title}**\n${choiceNotes}`;
          } else {
            return null;
          }
        }),
        R.filter(R.isNotNil),
        R.join('\n'),
      )(packRows.value);
      const globalNotes = R.pipe(
        R.values,
        R.filter((note: ProjectNote) => R.startsWith('build-', note.id)),
        R.map((note: ProjectNote) => {
          return `**${note.title}**\n${note.text}`;
        }),
        R.join('\n'),
      )(notes);

      if (isNotEmpty(rowNotes)) {
        result += `\n\n==Build Notes==\n${rowNotes.trimEnd()}`;
      }
      if (isNotEmpty(globalNotes)) {
        result += `\n\n==Global Notes==\n${globalNotes.trimEnd()}`;
      }
    }

    return result;
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
    let result = R.pipe(
      R.map(([id, amt]) => {
        return amt > 1 ? `${id}:${amt}` : id;
      }),
      R.join(';'),
    )(R.toPairs(selected.value));

    if (isNotEmpty(buildNotes.value)) {
      const notesJson = JSON.stringify(buildNotes.value);
      const notesB64 = Base64.toBase64(notesJson, true);
      result += `;notes=${notesB64}`;
    }

    return result;
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
