import { z } from 'zod';

export const SectionItemSchema = z.object({
  title: z.string().min(1).max(160),
  subtitle: z.string().max(160).nullable().optional(),
  date: z.string().max(80).nullable().optional(),
  desc: z.string().max(1000).nullable().optional(),
  link: z.string().url().or(z.literal('')).nullable().optional(),
});

export const CreatePortfolioSectionSchema = z.object({
  locale: z.enum(['ko', 'en']),
  sectionKey: z.string().min(1).max(80),
  title: z.string().min(1).max(160),
  body: z.string().max(20000).nullable().optional(),
  items: z.array(SectionItemSchema).nullable().optional(),
  order: z.number().int().nonnegative().optional(),
  isVisible: z.boolean().optional(),
});

export const UpdatePortfolioSectionSchema = CreatePortfolioSectionSchema.partial().omit({ locale: true });

export const ReorderSectionsSchema = z.object({
  ids: z.array(z.number().int().positive()),
});

export const GetPortfolioQuerySchema = z.object({
  locale: z.enum(['ko', 'en']).optional(),
});

export interface CreatePortfolioSectionDto {
  locale: 'ko' | 'en';
  sectionKey: string;
  title: string;
  body?: string | null;
  items?: Array<{ title: string; subtitle?: string | null; date?: string | null; desc?: string | null; link?: string | null }> | null;
  order?: number;
  isVisible?: boolean;
}

export interface UpdatePortfolioSectionDto {
  sectionKey?: string;
  title?: string;
  body?: string | null;
  items?: Array<{ title: string; subtitle?: string | null; date?: string | null; desc?: string | null; link?: string | null }> | null;
  order?: number;
  isVisible?: boolean;
}
