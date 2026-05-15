import { z } from 'zod';

export const UpdateQuickRepliesSchema = z.object({
  replies: z.array(
    z.object({
      id: z.number().int().optional(),
      body: z.string().min(1).max(100),
      sortOrder: z.number().int().min(0),
    })
  ).max(5),
});

export type UpdateQuickRepliesDto = z.infer<typeof UpdateQuickRepliesSchema>;
