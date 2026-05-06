import { z } from 'zod';

export const LayoutSectionSchema = z.object({
  sectionKey: z.string().min(1).max(50),
  postIds: z.array(z.number().int().positive()),
  order: z.number().int().optional(),
  isVisible: z.boolean(),
});

export const UpdateLayoutSchema = z.array(LayoutSectionSchema).refine(sections => {
  const keys = sections.map(s => s.sectionKey);
  return keys.length === new Set(keys).size;
}, {
  message: 'Duplicate sectionKey is not allowed',
  path: [],
});

export interface LayoutSection {
  sectionKey: string;
  postIds: number[];
  order: number;
  isVisible: boolean;
}

export type UpdateLayoutDto = LayoutSection[];
