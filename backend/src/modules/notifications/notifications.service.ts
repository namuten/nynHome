import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateNotificationInput {
  type: string; // 'new_comment' | 'new_guestbook' | 'report_resolved' | 'broadcast'
  title: string;
  body: string;
  linkUrl?: string;
  userId?: number; // nullable = 관리자용 알림이면 null
}

export interface GetNotificationsInput {
  userId?: number | null;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

export class NotificationsService {
  /**
   * 알림을 생성합니다.
   */
  static async createNotification(data: CreateNotificationInput) {
    return prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        body: data.body,
        linkUrl: data.linkUrl || null,
        userId: data.userId || null, // null 이면 관리자용 전역 알림
      },
    });
  }

  /**
   * 사용자의 알림 목록을 페이징하여 가져옵니다.
   */
  static async getNotifications(params: GetNotificationsInput) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.userId !== undefined) {
      where.userId = params.userId;
    }
    if (params.isRead !== undefined) {
      where.isRead = params.isRead;
    }

    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * 지정된 알림 목록을 읽음 처리합니다.
   */
  static async markAsRead(ids: number[], userId?: number | null) {
    const where: any = { id: { in: ids } };
    if (userId !== undefined) {
      where.userId = userId;
    }

    await prisma.notification.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * 전체 알림을 일괄 읽음 처리합니다.
   */
  static async markAllAsRead(userId: number | null) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * 읽지 않은 알림 카운트를 가져옵니다.
   */
  static async getUnreadCount(userId: number | null) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * 단일 알림을 영구히 삭제합니다 (관리자용).
   */
  static async deleteNotification(id: number) {
    return prisma.notification.delete({
      where: { id },
    });
  }

  /**
   * 관리자의 알림 수신 설정 정보를 가져옵니다.
   */
  static async getPreferences(adminUserId: number) {
    let pref = await prisma.notificationPreference.findUnique({
      where: { adminUserId },
    });

    if (!pref) {
      pref = await prisma.notificationPreference.create({
        data: {
          adminUserId,
          onNewComment: true,
          onNewGuestbook: true,
          onReportFlagged: true,
          emailDigestFreq: 'weekly',
        },
      });
    }

    return pref;
  }

  /**
   * 관리자의 알림 수신 설정 정보를 수정합니다.
   */
  static async updatePreferences(adminUserId: number, data: {
    onNewComment?: boolean;
    onNewGuestbook?: boolean;
    onReportFlagged?: boolean;
    emailDigestFreq?: string;
    emailAddress?: string;
  }) {
    // Upsert preference
    return prisma.notificationPreference.upsert({
      where: { adminUserId },
      update: data,
      create: {
        adminUserId,
        onNewComment: data.onNewComment ?? true,
        onNewGuestbook: data.onNewGuestbook ?? true,
        onReportFlagged: data.onReportFlagged ?? true,
        emailDigestFreq: data.emailDigestFreq ?? 'weekly',
        emailAddress: data.emailAddress || null,
      },
    });
  }
}
