import { z } from 'zod';

export const LocaleCodeSchema = z.enum(['ko', 'en']);

export const AchievementItemSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(1000).optional(),
  date: z.string().max(30).optional(),
});

export const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(120),
  tagline: z.string().max(200).nullable().optional(),
  bio: z.string().max(10000).nullable().optional(),
  avatarUrl: z.string().url().or(z.literal('')).nullable().optional(),
  coverImageUrl: z.string().url().or(z.literal('')).nullable().optional(),
  school: z.string().max(120).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  emailPublic: z.string().email().or(z.literal('')).nullable().optional(),
  socialLinks: z.record(z.string(), z.string().max(500)).nullable().optional(),
  interests: z.array(z.string().max(60)).nullable().optional(),
  skills: z.array(z.string().max(60)).nullable().optional(),
  achievements: z.array(AchievementItemSchema).nullable().optional(),
});

export const GetProfileQuerySchema = z.object({
  locale: LocaleCodeSchema.optional(),
});

export interface UpdateProfileDto {
  displayName: string;
  tagline?: string | null;
  bio?: string | null;
  avatarUrl?: string | null;
  coverImageUrl?: string | null;
  school?: string | null;
  location?: string | null;
  emailPublic?: string | null;
  socialLinks?: Record<string, string> | null;
  interests?: string[] | null;
  skills?: string[] | null;
  achievements?: Array<{ title: string; description?: string; date?: string }> | null;
}
