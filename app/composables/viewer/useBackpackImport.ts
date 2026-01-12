import { Base64 } from 'js-base64';
import * as R from 'ramda';
import { isNotEmpty } from 'ramda';

import type { ProjectNote } from '~/composables/project/types/v1';
import type { Selections } from '~/composables/store/project';

const LEGACY_RX =
  /^(?:[a-zA-Z0-9-_!@&.]+(?:\/ON#\d+)?)(?:,[a-zA-Z0-9-_!@&.]+(?:\/ON#\d+)?)*$/;

export type ImportResult = {
  selections: Selections;
  notes?: Record<string, ProjectNote>;
};

export function useBackpackImport() {
  const readImportCode = (code: string | undefined): ImportResult | null => {
    let _code = code?.trim();

    if (!_code) {
      return null;
    }

    // Trim any trailing comma/semicolon, if present.
    if (_code.endsWith(',') || _code.endsWith(';')) {
      _code = _code.substring(0, _code.length - 1);
    }
    // Trim any leading comma/semicolon, if present.
    if (_code.startsWith(',') || _code.startsWith(';')) {
      _code = _code.substring(1);
    }

    const selections: Selections = {};
    let notes: Record<string, ProjectNote> | undefined;

    if (LEGACY_RX.test(_code)) {
      console.log(`Legacy Import Mode`);
      R.split(',', _code).forEach((part) => {
        const sepIdx = part.indexOf('/ON#');
        if (sepIdx === -1) {
          selections[part] = 1;
        } else {
          const objId = part.substring(0, sepIdx);
          const amountS = part.substring(sepIdx + 4);
          selections[objId] = Number.parseInt(amountS);
        }
      });
    } else {
      R.split(';', _code).forEach((part) => {
        // Check if this is the notes part
        if (part.startsWith('notes=')) {
          const notesB64 = part.substring(6);
          try {
            const notesJson = Base64.fromBase64(notesB64);
            notes = JSON.parse(notesJson);
          } catch (error) {
            console.error('Failed to parse notes:', error);
          }
          return;
        }

        const sepIdx = part.indexOf(':');
        if (sepIdx === -1) {
          selections[part] = 1;
        } else {
          const [objId, amountS] = R.split(':', part);
          selections[objId] = Number.parseInt(amountS);
        }
      });
    }

    return { selections, notes };
  };

  return { readImportCode };
}
