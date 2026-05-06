import { z } from 'zod';

export const CreateCommentSchema = z.object({
  body: z.string().min(1).max(2000),
  parentId: z.number().int().positive().optional(),
});

export const ReplyCommentSchema = z.object({
  reply: z.string().min(1).max(2000),
});

export interface CreateCommentDto {
  body: string;
}

export interface ReplyCommentDto {
  reply: string;
}
