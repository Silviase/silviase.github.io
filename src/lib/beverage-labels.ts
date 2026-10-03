/**
 * Reviewed public label catalog. Coordinates must be manually checked origins,
 * never EXIF/GPS coordinates copied from a private photograph.
 *
 * Only prepared public images belong in this catalog. Private photo paths,
 * Drive IDs, and original photo metadata do not belong in the public manifest.
 */
import catalog from '../../_data/beverage-labels.json';
import { z } from 'astro/zod';
export type BeverageCategory = 'craft-beer' | 'wine' | 'sake' | 'other';

export interface BeverageLabel {
  /** Unique per beverage variant; alternate photos of one item share one entry. */
  id: string;
  name: string;
  image?: { src: string; alt: string; sourceUrl: string; originalUrl: string };
  /** Verified Japanese wording; keep the original name available for search. */
  nameJa?: string;
  producer?: string;
  producerJa?: string;
  category: BeverageCategory;
  vintage?: string;
  style?: string;
  /** Product-specific facts, never inferred from an appellation alone. */
  appellation?: string;
  wineRegion?: string;
  terroir?: string;
  metadataSources?: string[];
  displayNote?: { en: string; ja: string };
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
const translatedText = z.object({ en: z.string().min(1), ja: z.string().min(1) }).strict();
const labelSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    image: z
      .object({
        src: z.string().regex(/^\/assets\/labels\/[a-z0-9-]+\.(?:webp|jpg|png)$/),
        alt: z.string().min(1),
        sourceUrl,
        originalUrl: sourceUrl,
      })
      .strict()
      .optional(),
    nameJa: z.string().min(1).optional(),
    producer: z.string().optional(),
    producerJa: z.string().min(1).optional(),
    category: z.enum(['craft-beer', 'wine', 'sake', 'other']),
    vintage: z.string().optional(),
    style: z.string().optional(),
    appellation: z.string().min(1).optional(),
    wineRegion: z.string().min(1).optional(),
    terroir: z.string().min(1).optional(),
    metadataSources: z.array(sourceUrl).min(1).optional(),
    displayNote: translatedText.optional(),
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
  .strict()
  .refine((item) => !item.terroir || Boolean(item.metadataSources?.length), {
    message: 'Terroir descriptions require product-specific source links.',
    path: ['metadataSources'],
  });

export const beverageLabels: BeverageLabel[] = z.array(labelSchema).parse(catalog);
if (new Set(beverageLabels.map((label) => label.id)).size !== beverageLabels.length) {
  throw new Error('Beverage label IDs must be unique.');
}
