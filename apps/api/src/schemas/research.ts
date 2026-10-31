import { z } from 'zod';

const urlSchema = z
  .string()
  .url('Must be a valid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    { message: 'URL must start with http:// or https://' }
  );

/**
 * Schema for creating a new research session.
 */
export const CreateResearchSchema = z.object({
  question: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question must be at most 500 characters')
    .trim(),
  objective: z
    .string()
    .max(1000, 'Objective must be at most 1000 characters')
    .trim()
    .optional(),
  sourceUrls: z
    .array(urlSchema)
    .max(10, 'Maximum 10 source URLs allowed')
    .optional(),
});

/**
 * Schema for adding sources to a research session.
 */
export const AddSourceSchema = z.object({
  urls: z
    .array(urlSchema)
    .min(1, 'At least one URL is required')
    .max(10, 'Maximum 10 URLs allowed'),
});

export type CreateResearchInput = z.infer<typeof CreateResearchSchema>;
export type AddSourceInput = z.infer<typeof AddSourceSchema>;
