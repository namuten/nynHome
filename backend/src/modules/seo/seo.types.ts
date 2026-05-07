import { z } from 'zod';

export const GetSeoQuerySchema = z.object({
  routeKey: z.string().min(1, 'routeKey는 필수입니다.'),
  locale: z.enum(['ko', 'en']).optional(),
});

export const UpdateSeoBodySchema = z.object({
  title: z.string().min(1, '타이틀은 필수이며 최소 1글자 이상이어야 합니다.').max(180, '타이틀은 최대 180자까지 입력 가능합니다.'),
  description: z.string().max(300, '설명은 최대 300자까지 입력 가능합니다.').optional().nullable(),
  ogImageUrl: z.string().url('올바른 URL 형식이어야 합니다.').or(z.string().length(0)).or(z.null()).optional(),
  keywords: z.array(z.string()).optional().nullable(),
  locale: z.enum(['ko', 'en']),
});

export type GetSeoQuery = z.infer<typeof GetSeoQuerySchema>;
export type UpdateSeoBody = z.infer<typeof UpdateSeoBodySchema>;
