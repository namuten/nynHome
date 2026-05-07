import { z } from 'zod';

export const GuestbookListQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default(20),
});

export const CreateGuestbookEntrySchema = z.object({
  body: z.string().min(1, '메시지를 입력해 주세요.').max(1000, '메시지는 최대 1000자까지 입력 가능합니다.'),
});

export const GuestbookReportSchema = z.object({
  reason: z.enum(['spam', 'harassment', 'personal_info', 'inappropriate', 'other']),
  description: z.string().max(500, '상세 설명은 최대 500자까지 입력 가능합니다.').optional(),
});

export type GuestbookListQueryDto = z.infer<typeof GuestbookListQuerySchema>;
export type CreateGuestbookEntryDto = z.infer<typeof CreateGuestbookEntrySchema>;
export type GuestbookReportDto = z.infer<typeof GuestbookReportSchema>;
