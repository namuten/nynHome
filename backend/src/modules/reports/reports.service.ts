import { prisma } from '../../lib/prisma';
import type { CreateCommentReportDto } from './reports.types';
import { Prisma } from '@prisma/client';

export async function createCommentReport(
  commentId: number,
  reporterUserId: number,
  data: CreateCommentReportDto
) {
  // Check if comment exists
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error('NOT_FOUND');
  }

  try {
    const report = await prisma.commentReport.create({
      data: {
        commentId,
        reporterUserId,
        reason: data.reason,
        description: data.description,
        status: 'open',
      },
    });

    return report;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint failed
      if (error.code === 'P2002') {
        throw new Error('ALREADY_REPORTED');
      }
    }
    throw error;
  }
}
