import { Base64 } from 'js-base64';
import * as R from 'ramda';
import { isNotEmpty } from 'ramda';

import { buildConditions } from '~/composables/conditions';
import type {
  ConditionTerm,
  PointType,
  ProjectNote,
  ProjectObj,
} from '~/composables/project/types/v1';
import { useProjectRefs, useProjectStore } from '~/composables/store/project';
import {
  type PackRow,
  type PackRowChoice,
  useBackpack,
} from '~/composables/viewer/useBackpack';
import { usePoints } from '~/composables/viewer/usePoints';

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
  const {
    selected,
    buildNotes,
    project,
    pointTypes,
    selectedIds,
    getPointType,
  } = useProjectRefs();
  const { points } = usePoints();

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

  const stripHtml = (html: string): string =>
    html.replace(/<[^>]*>/g, '').trim();

  const formatCondText = (req: ConditionTerm): string => {
    let prefix = '';
    if (!req.required) {
      prefix = 'Incompatible: ';
    } else if (req.beforeText) {
      prefix = `${req.beforeText.trim()} `;
    }

    let body = '';
    if (req.type === 'id') {
      body = getObject(req.reqId)?.title ?? '???';
    } else if (req.type === 'or') {
      const parts: string[] = [];
      for (const { req: r } of req.orRequired) {
        if (!r) continue;
        parts.push(getObject(r)?.title ?? '???');
      }
      body = parts.join(', or ');
    }

    const suffix = req.afterText ? ` ${req.afterText.trim()}` : '';
    return `${prefix}${body}${suffix}`;
  };

  const createExportMarkdown = (): string => {
    const lines: string[] = [];

    if (project.value?.projectName) {
      lines.push(`# ${project.value.projectName}`);
      lines.push('');
    }

    const activeScores = (pointTypes.value as PointType[]).filter(
      (pt) =>
        R.isEmpty(pt.activatedId) || R.has(pt.activatedId, selected.value),
    );
    if (activeScores.length > 0) {
      lines.push('## Scores');
      for (const pt of activeScores) {
        const value = points.value[pt.id] ?? 0;
        const parts = [pt.beforeText, String(value), pt.afterText].filter(
          Boolean,
        );
        lines.push(`- ${parts.join(' ')}`);
      }
      lines.push('');
    }

    for (const { packRow, choices } of packRows.value) {
      lines.push(`## ${packRow.title}`);
      lines.push('');

      for (const { obj, addons, count } of choices) {
        const titleSuffix =
          count > 1 || obj.isSelectableMultiple ? ` (x${count})` : '';
        lines.push(`### ${obj.title}${titleSuffix}`);

        const activeScoresForObj = obj.scores.filter((score) => {
          const cond = buildConditions(score);
          const pointType = getPointType.value(score.id);
          return (
            cond(selectedIds.value) &&
            (R.isNil(pointType) ||
              R.isEmpty(pointType.activatedId) ||
              R.includes(pointType.activatedId, selectedIds.value))
          );
        });
        for (const score of activeScoresForObj) {
          const absVal = Math.abs(Number.parseInt(score.value));
          const parts = [
            score.beforeText,
            String(absVal),
            score.afterText,
          ].filter(Boolean);
          if (parts.length > 0) lines.push(`- ${parts.join(' ')}`);
        }

        const visibleReqs = obj.requireds.filter((req) => req.showRequired);
        for (const req of visibleReqs) {
          lines.push(`- ${formatCondText(req)}`);
        }

        if (activeScoresForObj.length > 0 || visibleReqs.length > 0) {
          lines.push('');
        }

        const text = stripHtml(obj.text);
        if (text) {
          lines.push(text);
          lines.push('');
        }

        for (const addon of addons) {
          lines.push(`#### ${addon.title}`);
          for (const req of addon.requireds) {
            lines.push(`- ${formatCondText(req)}`);
          }
          if (addon.requireds.length > 0) {
            lines.push('');
          }
          const addonText = stripHtml(addon.text);
          if (addonText) {
            lines.push(addonText);
          }
          lines.push('');
        }
      }
    }

    if (isNotEmpty(buildNotes.value)) {
      const notes = buildNotes.value;
      const rowNoteLines: string[] = [];

      for (const { packRow, choices } of packRows.value) {
        const hasRowNote = R.has(`row:${packRow.id}`, notes);
        const choiceNoteLines: string[] = [];

        for (const { obj } of choices) {
          if (R.has(`obj:${obj.id}`, notes)) {
            choiceNoteLines.push(
              `**${obj.title}:** ${notes[`obj:${obj.id}`].text.trim()}`,
            );
          }
        }

        if (hasRowNote || choiceNoteLines.length > 0) {
          rowNoteLines.push(`### ${packRow.title}`);
          if (hasRowNote)
            rowNoteLines.push(notes[`row:${packRow.id}`].text.trim());
          rowNoteLines.push(...choiceNoteLines);
          rowNoteLines.push('');
        }
      }

      if (rowNoteLines.length > 0) {
        lines.push('## Build Notes');
        lines.push('');
        lines.push(...rowNoteLines);
      }

      const globalNotes = R.pipe(
        R.values,
        R.filter((note: ProjectNote) => R.startsWith('build-', note.id)),
      )(notes) as ProjectNote[];

      if (isNotEmpty(globalNotes)) {
        lines.push('## Global Notes');
        lines.push('');
        for (const note of globalNotes) {
          lines.push(`### ${note.title}`);
          lines.push(note.text);
          lines.push('');
        }
      }
    }

    return lines.join('\n');
  };

  const downloadMarkdown = () => {
    const content = createExportMarkdown();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `build-${new Date().toLocaleDateString()}.md`;
    element.click();
    element.remove();
    URL.revokeObjectURL(url);
  };

  return { createExportText, createExportCode, downloadMarkdown };
}
