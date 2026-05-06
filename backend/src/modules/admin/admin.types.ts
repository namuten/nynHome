import { z } from 'zod';

export const UpdateMediaTypeSchema = z.object({
  isAllowed: z.boolean().optional(),
  maxSizeMb: z.number().int().min(1).max(1000).optional(),
});

export interface UpdateMediaTypeDto {
  isAllowed?: boolean;
  maxSizeMb?: number;
}
