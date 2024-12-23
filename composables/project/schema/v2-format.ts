import { array, object, string } from 'yup';

export const V2SchemaId = 'https://cyoa.ltouroumov.ch/.schema/v2.json';

export const V2ProjectSchema = object({
  $schema: string().test(
    'is-v2-schema',
    (d) => `${d.path} is not ${V2SchemaId}`,
    (value: string | undefined) => value === V2SchemaId,
  ),
  $project: object({
    name: string(),
  }),

  content: object({
    entries: object(),
    children: object(),
    scores: object(),
  }),
  config: object({
    pages: object({
      main: string(),
    }),
    backpack: object({
      rows: array(object()),
    }),
  }),
  styles: object({
    rules: object({}),
    defaults: object({}),
  }),
  media: object({}),
});
