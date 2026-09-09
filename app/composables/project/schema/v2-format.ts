import { z } from 'zod';

export const V2SchemaId = 'https://cyoa.ltouroumov.ch/.schema/v2.json';

export const V2ProjectSchema = z.object({
  $schema: z
    .string()
    .refine((value: string | undefined) => value === V2SchemaId, {
      error: (d) => `${d} is not ${V2SchemaId}`,
    }),
  $project: z.object({
    name: z.string(),
  }),

  content: z.object({
    objects: z.object({}),
    children: z.object({}),
    scores: z.object({}),
  }),
  config: z.object({
    pages: z.object({
      main: z.string(),
    }),
    backpack: z.object({
      rows: z.array(z.object({})),
    }),
  }),
  styles: z.object({
    rules: z.object({}),
    defaults: z.object({}),
  }),
  media: z.object({}),
});
