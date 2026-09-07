import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
const papers = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './_papers',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z
    .object({
      title: z.string(),
      authors: z.array(z.string()),
      date: z.coerce.date(),
      type: z.enum(['international', 'domestic', 'journal']),
      venue: z.string().optional(),
      journal: z.string().optional(),
      description: z.string().optional(),
      pdf: z.string().nullish(),
      pdf_link: z.string().optional(),
      code_link: z.string().optional(),
      doi: z.string().optional(),
      bibtex: z.string().optional(),
    })
    .refine((data) => data.venue || data.journal, 'A venue or journal is required'),
});
const posts = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './_posts',
    generateId: ({ entry }) => entry.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string().optional(),
    author: z.string().default('Koki Maeda'),
  }),
});
export const collections = { papers, posts };
