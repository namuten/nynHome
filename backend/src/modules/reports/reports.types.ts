import { z } from 'zod';

export const CreateCommentReportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'personal_info', 'inappropriate', 'other']),
  description: z.string().max(1000).optional(),
});

export type CreateCommentReportDto = z.infer<typeof CreateCommentReportSchema>;
