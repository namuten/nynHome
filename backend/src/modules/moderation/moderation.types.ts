import { z } from 'zod';

export const ReportListQuerySchema = z.object({
  type: z.enum(['comment', 'guestbook']).optional(),
  status: z.enum(['open', 'reviewing', 'resolved', 'rejected']).optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(20),
});

export const UpdateReportStatusSchema = z.object({
  status: z.enum(['reviewing', 'resolved', 'rejected']),
  resolutionNote: z.string().optional(),
});

export const ModerationQueueQuerySchema = z.object({
  status: z.enum(['open', 'reviewing', 'resolved', 'rejected']).optional(),
  kind: z.enum(['comment', 'guestbook']).optional(),
});

export const ModerateCommentSchema = z.object({
  isHidden: z.boolean(),
  hiddenReason: z.string().optional().nullable(),
});

export const ModerateGuestbookSchema = z.object({
  isHidden: z.boolean(),
  hiddenReason: z.string().optional().nullable(),
});

export type ReportListQueryDto = z.infer<typeof ReportListQuerySchema>;
export type UpdateReportStatusDto = z.infer<typeof UpdateReportStatusSchema>;
export type ModerationQueueQueryDto = z.infer<typeof ModerationQueueQuerySchema>;
export type ModerateCommentDto = z.infer<typeof ModerateCommentSchema>;
export type ModerateGuestbookDto = z.infer<typeof ModerateGuestbookSchema>;
