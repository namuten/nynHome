import { prisma } from '../../lib/prisma';
import type { ReportListQueryDto, UpdateReportStatusDto, ModerationQueueQueryDto, ModerateCommentDto, ModerateGuestbookDto } from './moderation.types';
import { recordAuditLog } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export async function listReports(query: ReportListQueryDto) {
  const skip = (query.page - 1) * query.limit;

  if (query.type === 'guestbook') {
    const where: Prisma.GuestbookReportWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      prisma.guestbookReport.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporterUser: { select: { id: true, nickname: true, email: true } },
          guestbookEntry: { select: { id: true, body: true, isHidden: true, userId: true } },
        },
      }),
      prisma.guestbookReport.count({ where }),
    ]);

    // Map to a unified return type
    const mappedItems = items.map((r) => ({
      id: r.id,
      reason: r.reason,
      description: r.description,
      status: r.status,
      resolutionNote: r.resolutionNote,
      resolvedByAdminId: r.resolvedByAdminId,
      createdAt: r.createdAt,
      reporterUser: r.reporterUser,
      comment: {
        id: r.guestbookEntry.id,
        body: r.guestbookEntry.body,
        isHidden: r.guestbookEntry.isHidden,
        userId: r.guestbookEntry.userId,
      },
    }));

    return {
      items: mappedItems,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  } else {
    const where: Prisma.CommentReportWhereInput = {};
    if (query.status) {
      where.status = query.status;
    }

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
}

export async function updateReportStatus(
  type: string,
  id: number,
  data: UpdateReportStatusDto,
  adminId: number,
  req: Request
) {
  if (type !== 'comment' && type !== 'guestbook') {
    throw new Error('UNSUPPORTED_TYPE');
  }

  if (type === 'comment') {
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

    // 알림 자동 생성
    await NotificationsService.createNotification({
      type: 'report_resolved',
      title: '신고 처리 완료',
      body: `댓글 신고가 처리되었습니다. (${data.status})`,
      linkUrl: `/admin/moderation`,
    });

    return updated;
  } else {
    const report = await prisma.guestbookReport.findUnique({ where: { id } });
    if (!report) {
      throw new Error('NOT_FOUND');
    }

    const updated = await prisma.guestbookReport.update({
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
      resourceType: 'guestbook_report',
      resourceId: id.toString(),
      summary: `Resolved guestbook report ${id} with status ${data.status}`,
      metadata: { status: data.status, resolutionNote: data.resolutionNote },
      req,
    });

    // 알림 자동 생성
    await NotificationsService.createNotification({
      type: 'report_resolved',
      title: '신고 처리 완료',
      body: `방명록 신고가 처리되었습니다. (${data.status})`,
      linkUrl: `/admin/moderation`,
    });

    return updated;
  }
}

export async function getModerationQueue(query: ModerationQueueQueryDto) {
  const statusFilter = query.status ? [query.status] : ['open', 'reviewing'];
  const queue: any[] = [];

  // 1. Fetch Comment Reports
  if (!query.kind || query.kind === 'comment') {
    const commentReports = await prisma.commentReport.findMany({
      where: { status: { in: statusFilter as any } },
      orderBy: { createdAt: 'desc' },
      include: {
        comment: true,
        reporterUser: { select: { id: true, nickname: true } },
      },
    });

    const mappedComments = commentReports.map((r) => ({
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

    queue.push(...mappedComments);
  }

  // 2. Fetch Guestbook Reports
  if (!query.kind || query.kind === 'guestbook') {
    const guestbookReports = await prisma.guestbookReport.findMany({
      where: { status: { in: statusFilter as any } },
      orderBy: { createdAt: 'desc' },
      include: {
        guestbookEntry: true,
        reporterUser: { select: { id: true, nickname: true } },
      },
    });

    const mappedGuestbooks = guestbookReports.map((r) => ({
      queueId: `guestbook_report_${r.id}`,
      kind: 'guestbook',
      targetId: r.guestbookEntryId,
      contentBody: r.guestbookEntry.body,
      reporter: r.reporterUser.nickname,
      reason: r.reason,
      description: r.description,
      status: r.status,
      createdAt: r.createdAt,
      isHidden: r.guestbookEntry.isHidden,
    }));

    queue.push(...mappedGuestbooks);
  }

  // Sort unified list by createdAt desc
  return queue.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
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

export async function moderateGuestbook(
  id: number,
  data: ModerateGuestbookDto,
  adminId: number,
  req: Request
) {
  const entry = await prisma.guestbookEntry.findUnique({ where: { id } });
  if (!entry) {
    throw new Error('NOT_FOUND');
  }

  const updated = await prisma.guestbookEntry.update({
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
    action: 'guestbook.moderate',
    resourceType: 'guestbook',
    resourceId: id.toString(),
    summary: `Moderated guestbook entry ${id} (isHidden: ${data.isHidden})`,
    metadata: { isHidden: data.isHidden, hiddenReason: data.hiddenReason },
    req,
  });

  return updated;
}
