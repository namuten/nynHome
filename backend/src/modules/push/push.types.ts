import { z } from 'zod';

export const SubscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export const SendPushSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  url: z.string().regex(/^\//, { message: "Internal path must start with '/'" }).optional(),
  imageUrl: z.string().url().or(z.literal('')).optional(),           // 이미지 URL (신규)
  targetType: z.enum(['all', 'user']).default('all'), // 발송 대상 타입 (신규)
  targetUserId: z.number().int().positive().optional(), // 특정 유저 ID (신규)
});

export const NativeTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['android', 'ios']),
});

export interface SubscribeDto {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface SendPushDto {
  title: string;
  body: string;
  url?: string;
  imageUrl?: string;
  targetType: 'all' | 'user';
  targetUserId?: number;
}

export interface NativeTokenDto {
  token: string;
  platform: 'android' | 'ios';
}
