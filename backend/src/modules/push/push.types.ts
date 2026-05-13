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
}

export interface NativeTokenDto {
  token: string;
  platform: 'android' | 'ios';
}
