import { prisma } from '../../lib/prisma';
import type { ReportListQueryDto, UpdateReportStatusDto, ModerationQueueQueryDto, ModerateCommentDto } from './moderation.types';
import { recordAuditLog } from '../audit/audit.service';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export async function listReports(query: ReportListQueryDto) {
  const skip = (query.page - 1) * query.limit;

  const where: Prisma.CommentReportWhereInput = {};
  if (query.status) {
    where.status = query.status;
  }

  // Currently we only have comment reports, guestbook to be added later
  const [items, total] = await Promise.all([
    prisma.commentReport.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reporterUser: { select: { id: true, nickname: true, email: true } },
        comment: { select: { id: true, body: true, isHidden: true, userId: true } },
      },
    }),
    prisma.commentReport.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function updateReportStatus(
  type: string,
  id: number,
  data: UpdateReportStatusDto,
  adminId: number,
  req: Request
) {
  if (type !== 'comment') {
    throw new Error('UNSUPPORTED_TYPE');
  }

  const report = await prisma.commentReport.findUnique({ where: { id } });
  if (!report) {
    throw new Error('NOT_FOUND');
  }

  const updated = await prisma.commentReport.update({
    where: { id },
    data: {
      status: data.status,
      resolutionNote: data.resolutionNote,
      resolvedByAdminId: adminId,
    },
  });

  await recordAuditLog({
    adminUserId: adminId,
    action: 'report.resolve',
    resourceType: 'comment_report',
    resourceId: id.toString(),
    summary: `Resolved comment report ${id} with status ${data.status}`,
    metadata: { status: data.status, resolutionNote: data.resolutionNote },
    req,
  });

  return updated;
}

export async function getModerationQueue(query: ModerationQueueQueryDto) {
  // A simplistic moderation queue that joins reports with target content
  // For now we just return comment reports that are open/reviewing
  const statusFilter = query.status ? [query.status] : ['open', 'reviewing'];
  
  const commentReports = await prisma.commentReport.findMany({
    where: { status: { in: statusFilter as any } },
    orderBy: { createdAt: 'desc' },
    include: {
      comment: true,
      reporterUser: { select: { id: true, nickname: true } },
    },
  });

  // map them to a unified format
  const queue = commentReports.map((r) => ({
    queueId: `comment_report_${r.id}`,
    kind: 'comment',
    targetId: r.commentId,
    contentBody: r.comment.body,
    reporter: r.reporterUser.nickname,
    reason: r.reason,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt,
    isHidden: r.comment.isHidden,
  }));

  return queue;
}

export async function moderateComment(
  id: number,
  data: ModerateCommentDto,
  adminId: number,
  req: Request
) {
  const comment = await prisma.comment.findUnique({ where: { id } });
  if (!comment) {
    throw new Error('NOT_FOUND');
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: {
      isHidden: data.isHidden,
      hiddenReason: data.hiddenReason,
      moderatedAt: new Date(),
      moderatedByAdminId: adminId,
    },
  });

  await recordAuditLog({
    adminUserId: adminId,
    action: 'comment.moderate',
    resourceType: 'comment',
    resourceId: id.toString(),
    summary: `Moderated comment ${id} (isHidden: ${data.isHidden})`,
    metadata: { isHidden: data.isHidden, hiddenReason: data.hiddenReason },
    req,
  });

  return updated;
}
