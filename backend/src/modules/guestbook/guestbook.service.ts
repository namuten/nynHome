import { prisma } from '../../lib/prisma';
import type { GuestbookListQueryDto, CreateGuestbookEntryDto, GuestbookReportDto } from './guestbook.types';

function isSpam(body: string): boolean {
  // URL이 2개 이상 포함된 경우 스팸 의심
  const urlRegex = /https?:\/\/[^\s]+/g;
  const matches = body.match(urlRegex);
  if (matches && matches.length >= 2) {
    return true;
  }
  return false;
}

export async function listEntries(query: GuestbookListQueryDto) {
  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    prisma.guestbookEntry.findMany({
      where: { isHidden: false },
      skip,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, nickname: true, avatarUrl: true } },
      },
    }),
    prisma.guestbookEntry.count({
      where: { isHidden: false },
    }),
  ]);

  return {
    items,
    total,
    page: query.page,
    limit: query.limit,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function createEntry(userId: number, data: CreateGuestbookEntryDto) {
  // 1. Spam guard (URL 개수 제한)
  if (isSpam(data.body)) {
    throw new Error('SPAM_DETECTED');
  }

  // 2. 어뷰징 방지 (동일인 5초 쿨다운 & 1분 이내 동일 내용 방지)
  const lastEntry = await prisma.guestbookEntry.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (lastEntry) {
    const diff = Date.now() - new Date(lastEntry.createdAt).getTime();
    if (diff < 5000) {
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    if (lastEntry.body === data.body && diff < 60000) {
      throw new Error('DUPLICATE_ENTRY');
    }
  }

  return await prisma.guestbookEntry.create({
    data: {
      userId,
      body: data.body,
    },
    include: {
      user: { select: { id: true, nickname: true, avatarUrl: true } },
    },
  });
}

export async function reportEntry(id: number, reporterUserId: number, data: GuestbookReportDto) {
  const entry = await prisma.guestbookEntry.findUnique({ where: { id } });
  if (!entry) {
    throw new Error('NOT_FOUND');
  }

  // 본인 방명록 신고 금지
  if (entry.userId === reporterUserId) {
    throw new Error('CANNOT_REPORT_OWN');
  }

  // 중복 신고 확인
  const existingReport = await prisma.guestbookReport.findUnique({
    where: {
      guestbookEntryId_reporterUserId: {
        guestbookEntryId: id,
        reporterUserId,
      },
    },
  });

  if (existingReport) {
    throw new Error('ALREADY_REPORTED');
  }

  return await prisma.guestbookReport.create({
    data: {
      guestbookEntryId: id,
      reporterUserId,
      reason: data.reason,
      description: data.description,
    },
  });
}
