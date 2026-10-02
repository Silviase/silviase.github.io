/**
 * Reviewed public label catalog. Coordinates must be manually checked origins,
 * never EXIF/GPS coordinates copied from a private photograph.
 *
 * This catalog contains text only. Private photo paths, Drive IDs, and original
 * photo metadata do not belong in the public manifest.
 */
import catalog from '../../_data/beverage-labels.json';
import { z } from 'astro/zod';
export type BeverageCategory = 'craft-beer' | 'wine' | 'sake' | 'other';

export interface BeverageLabel {
  /** Unique per beverage variant; alternate photos of one item share one entry. */
  id: string;
  name: string;
  producer?: string;
  category: BeverageCategory;
  vintage?: string;
  style?: string;
  officialSourceUrl?: string;
  origin: {
    country: string;
    countryCode: string;
    region?: string;
    locality?: string;
    latitude: number;
    longitude: number;
    verified: true;
    precision: 'producer' | 'locality' | 'region';
    sourceUrl: string;
    coordinateSourceUrl: string;
    precisionLabel: string;
  };
  confidence?: 'high' | 'medium' | 'low';
  note?: string;
}

const sourceUrl = z.url({ protocol: /^https$/ });
const labelSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    producer: z.string().optional(),
    category: z.enum(['craft-beer', 'wine', 'sake', 'other']),
    vintage: z.string().optional(),
    style: z.string().optional(),
    officialSourceUrl: sourceUrl.optional(),
    origin: z
      .object({
        country: z.string().min(1),
        countryCode: z.string().regex(/^[A-Z]{2}$/),
        region: z.string().optional(),
        locality: z.string().optional(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        verified: z.literal(true),
        precision: z.enum(['producer', 'locality', 'region']),
        sourceUrl,
        coordinateSourceUrl: sourceUrl,
        precisionLabel: z.string().min(1),
      })
      .strict(),
    confidence: z.enum(['high', 'medium', 'low']).optional(),
    note: z.string().optional(),
  })
  .strict();

export const beverageLabels: BeverageLabel[] = z.array(labelSchema).parse(catalog);
if (new Set(beverageLabels.map((label) => label.id)).size !== beverageLabels.length) {
  throw new Error('Beverage label IDs must be unique.');
}
