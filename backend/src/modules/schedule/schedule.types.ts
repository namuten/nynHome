import { z } from 'zod';

export const ScheduleBaseSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(5000).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const CreateScheduleSchema = ScheduleBaseSchema.refine(data => new Date(data.endAt) > new Date(data.startAt), {
  message: 'endAt must be after startAt',
  path: ['endAt'],
});

export const UpdateScheduleSchema = ScheduleBaseSchema.partial().refine(data => {
  if (data.startAt && data.endAt) {
    return new Date(data.endAt) > new Date(data.startAt);
  }
  return true;
}, {
  message: 'endAt must be after startAt',
  path: ['endAt'],
});

export const GetScheduleQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});

export interface CreateScheduleDto {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  color?: string;
}

export interface UpdateScheduleDto {
  title?: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  color?: string;
}
