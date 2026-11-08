// Typed content models. Posts are written in the Keystatic admin (keystatic.config.ts) and read
// here; the schema must accept exactly what Keystatic writes.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '*.mdoc', base: './src/content/posts' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        date: z.coerce.date(),
        summary: z.string().min(1).max(280),
        cover: image().nullish(),
        coverAlt: z.string().nullish(),
        series: z.enum(['none', 'learning-ai']).default('none'),
        part: z.number().int().min(1).nullish(),
        draft: z.boolean().default(true),
      })
      // A cover photo always needs a description for people who can't see it.
      .refine((p) => !p.cover || Boolean(p.coverAlt?.trim()), {
        message: 'A cover photo needs a description (coverAlt).',
        path: ['coverAlt'],
      }),
});

export const collections = { posts };
