import { isNotNil } from 'ramda';

import { StyleTarget } from '~/composables/project/types/v2/styles';

export type FormField =
  | {
      type: 'string';
      key: string;
      label: string;
      prop: string[];
      default: string;
    }
  | {
      type: 'number';
      key: string;
      label: string;
      prop: string[];
      default: number;
    };

export type FormGroupToggle = {
  prop: string[];
  label: string;
  default: any;
};

export type FormGroup = {
  type: 'group';
  key: string;
  label: string;
  children: FormField[];
  toggle?: FormGroupToggle;
};

export type FormSection = {
  type: 'section';
  key: string;
  label: string;
  children: (FormGroup | FormField)[];
};

export const SimpleStyleFormConfig: Record<
  StyleTarget,
  (FormSection | FormGroup)[]
> = {
  [StyleTarget.page]: [],
  [StyleTarget.row]: [],
  [StyleTarget.choice]: [
    {
      type: 'section',
      key: 'header',
      label: 'Header',
      children: [
        {
          type: 'group',
          key: 'background',
          label: 'Background',
          children: [
            {
              type: 'string',
              key: 'color',
              label: 'Color',
              prop: ['header', 'background', 'color'],
              default: 'ffffff',
            },
            {
              type: 'string',
              key: 'image',
              label: 'Image',
              prop: ['header', 'background', 'image'],
              default: '',
            },
          ],
        },
        {
          type: 'group',
          key: 'margin',
          label: 'Margins',
          children: [
            {
              type: 'string',
              key: 'top',
              label: 'Top',
              prop: ['header', 'margins', 'top'],
              default: '0px',
            },
            {
              type: 'string',
              key: 'bottom',
              label: 'Bottom',
              prop: ['header', 'margins', 'bottom'],
              default: '0px',
            },
          ],
          toggle: {
            prop: ['header', 'margins'],
            label: 'Enabled',
            default: { top: '0px', bottom: '0px' },
          },
        },
      ],
    },
    {
      type: 'section',
      key: 'content',
      label: 'Content',
      children: [],
    },
  ],
};

export function makeKey(...keys: (string | undefined)[]): string {
  return keys.filter(isNotNil).join('.');
}
