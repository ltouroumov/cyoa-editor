import { isNotNil } from 'ramda';

import { StyleTarget } from '~/composables/project/types/v2/styles';

type FormFieldBase = { key: string; label: string; prop: string[] };
export type FormField = FormFieldBase &
  (
    | { type: 'string'; default: string }
    | { type: 'number'; default: number }
    | { type: 'color'; default: string }
  );

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

export type Form = {
  label: string;
  children: (FormSection | FormGroup)[];
};

const makeMarginsForm = (prop: string[]): FormGroup => {
  return {
    type: 'group',
    key: 'margin',
    label: 'Margins',
    children: [
      {
        type: 'string',
        key: 'top',
        label: 'Top',
        prop: [...prop, 'top'],
        default: '0px',
      },
      {
        type: 'string',
        key: 'right',
        label: 'Right',
        prop: [...prop, 'right'],
        default: '0px',
      },
      {
        type: 'string',
        key: 'bottom',
        label: 'Bottom',
        prop: [...prop, 'bottom'],
        default: '0px',
      },
      {
        type: 'string',
        key: 'left',
        label: 'Left',
        prop: [...prop, 'left'],
        default: '0px',
      },
    ],
    toggle: {
      prop: prop,
      label: 'Enabled',
      default: {},
    },
  };
};

const makeBackgroundForm = (prop: string[]): FormGroup => {
  return {
    type: 'group',
    key: 'background',
    label: 'Background',
    children: [
      {
        type: 'color',
        key: 'color',
        label: 'Color',
        prop: [...prop, 'color'],
        default: 'ffffff',
      },
      {
        type: 'string',
        key: 'image',
        label: 'Image',
        prop: [...prop, 'image'],
        default: '',
      },
    ],
  };
};

const makeBorderForm = (prop: string[]): FormGroup => {
  return {
    type: 'group',
    key: 'border',
    label: 'Border',
    children: [
      {
        type: 'string',
        key: 'style',
        label: 'Style',
        prop: [...prop, 'style'],
        default: 'solid',
      },
      {
        type: 'string',
        key: 'width',
        label: 'Width',
        prop: [...prop, 'width'],
        default: '1px',
      },
      {
        type: 'string',
        key: 'color',
        label: 'Color',
        prop: [...prop, 'color'],
        default: 'ffffff',
      },
      {
        type: 'string',
        key: 'radius',
        label: 'Radius',
        prop: [...prop, 'radius'],
        default: '0px',
      },
    ],

    toggle: {
      prop: prop,
      label: 'Enabled',
      default: {},
    },
  };
};

const makeTextForm = (label: string, prop: string[]): FormGroup => {
  return {
    type: 'group',
    key: 'text',
    label: label,
    children: [
      {
        type: 'string',
        key: 'font-family',
        label: 'Font',
        prop: [...prop, 'fontFamily'],
        default: 'Arial',
      },
      {
        type: 'string',
        key: 'font-size',
        label: 'Size',
        prop: [...prop, 'fontSize'],
        default: '1rem',
      },
      {
        type: 'string',
        key: 'text-color',
        label: 'Color',
        prop: [...prop, 'textColor'],
        default: 'ffffff',
      },
    ],
  };
};

export const SimpleStyleFormConfig: Record<StyleTarget, Form> = {
  [StyleTarget.page]: {
    label: 'Page Style',
    children: [
      {
        type: 'section',
        key: 'header',
        label: 'Header',
        children: [
          makeBackgroundForm(['header', 'background']),
          makeMarginsForm(['header', 'margins']),
        ],
      },
      {
        type: 'section',
        key: 'content',
        label: 'Content',
        children: [
          makeMarginsForm(['content', 'margins']),
          {
            type: 'group',
            key: 'layout',
            label: 'Layout',
            children: [
              {
                type: 'string',
                key: 'layout',
                label: 'Layout',
                prop: ['content', 'layout'],
                default: 'list',
              },
              {
                type: 'string',
                key: 'gap',
                label: 'Gap',
                prop: ['content', 'gap'],
                default: '1rem',
              },
            ],
          },
        ],
      },
    ],
  },
  [StyleTarget.row]: {
    label: 'Row Style',
    children: [
      {
        type: 'section',
        key: 'header',
        label: 'Header',
        children: [
          makeBackgroundForm(['header', 'background']),
          makeMarginsForm(['header', 'margins']),
          makeBorderForm(['header', 'border']),
          makeTextForm('Title', ['header', 'title']),
          makeTextForm('Text', ['header', 'text']),
        ],
      },
      {
        type: 'section',
        key: 'content',
        label: 'Content',
        children: [
          makeMarginsForm(['content', 'margins']),
          {
            type: 'group',
            key: 'layout',
            label: 'Layout',
            children: [
              {
                type: 'string',
                key: 'layout',
                label: 'Layout',
                prop: ['content', 'layout'],
                default: 'list',
              },
              {
                type: 'string',
                key: 'gap',
                label: 'Gap',
                prop: ['content', 'gap'],
                default: '1rem',
              },
            ],
          },
        ],
      },
    ],
  },
  [StyleTarget.choice]: {
    label: 'Choice Style',
    children: [
      {
        type: 'section',
        key: 'header',
        label: 'Header',
        children: [
          makeBackgroundForm(['header', 'background']),
          makeMarginsForm(['header', 'margins']),
          makeBorderForm(['header', 'border']),
          makeTextForm('Title', ['header', 'title']),
          makeTextForm('Text', ['header', 'text']),
        ],
      },
      {
        type: 'section',
        key: 'content',
        label: 'Content',
        children: [
          makeMarginsForm(['content', 'margins']),
          {
            type: 'group',
            key: 'layout',
            label: 'Layout',
            children: [
              {
                type: 'string',
                key: 'layout',
                label: 'Layout',
                prop: ['content', 'layout'],
                default: 'list',
              },
              {
                type: 'string',
                key: 'gap',
                label: 'Gap',
                prop: ['content', 'gap'],
                default: '1rem',
              },
            ],
          },
        ],
      },
    ],
  },
};

export function makeKey(...keys: (string | undefined)[]): string {
  return keys.filter(isNotNil).join('.');
}
