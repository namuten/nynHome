import { NotificationsService } from '../src/modules/notifications/notifications.service';
import { prisma } from '../src/lib/prisma';

describe('Notifications Integration Tests', () => {
  let tempUserId: number;

  beforeAll(async () => {
    // 임시 테스트 유저 생성
    const user = await prisma.user.create({
      data: {
        email: 'notif_test@crochub.dev',
        passwordHash: 'hashed_password',
        nickname: 'NotifTester',
        role: 'user',
      }
    });
    tempUserId = user.id;
  });

  afterAll(async () => {
    // 테스트용 알림, 환경설정, 유저 정리
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { userId: tempUserId },
          { userId: null },
        ]
      }
    });
    await prisma.notificationPreference.deleteMany({
      where: { adminUserId: tempUserId }
    });
    await prisma.user.delete({
      where: { id: tempUserId }
    });
    await prisma.$disconnect();
  });

  it('should successfully store a new notification record', async () => {
    const notif = await NotificationsService.createNotification({
      type: 'new_comment',
      title: '새 댓글이 달렸어요!',
      body: '크로코다일 포스트에 댓글이 접수되었습니다.',
      linkUrl: '/admin/comments',
      userId: tempUserId,
    });

    expect(notif.id).toBeDefined();
    expect(notif.title).toBe('새 댓글이 달렸어요!');
    expect(notif.isRead).toBe(false);
    expect(notif.userId).toBe(tempUserId);
  });

  it('should mark notification as read and record current timestamp', async () => {
    const notif = await NotificationsService.createNotification({
      type: 'new_guestbook',
      title: '방명록 신규 알림',
      body: '방명록에 새 글이 등록되었습니다.',
      userId: tempUserId,
    });

    expect(notif.isRead).toBe(false);

    await NotificationsService.markAsRead([notif.id], tempUserId);

    const updated = await prisma.notification.findUnique({
      where: { id: notif.id }
    });

    expect(updated?.isRead).toBe(true);
    expect(updated?.readAt).toBeInstanceOf(Date);
  });

  it('should evaluate unread notification counts correctly', async () => {
    // 기존 테스트 알림 비우고 새롭게 개수 카운트 진행
    await prisma.notification.deleteMany({ where: { userId: tempUserId } });

    await NotificationsService.createNotification({
      type: 'broadcast',
      title: '전체 공지사항',
      body: '서버 점검 예정 안내',
      userId: tempUserId,
    });

    await NotificationsService.createNotification({
      type: 'report_resolved',
      title: '신고 수용',
      body: '신고 처리가 결말을 맺었습니다.',
      userId: tempUserId,
    });

    const count = await NotificationsService.getUnreadCount(tempUserId);
    expect(count).toBe(2);
  });

  it('should persist and retrieve notification preference settings', async () => {
    // 1. 디폴트 선언 검증
    const initialPref = await NotificationsService.getPreferences(tempUserId);
    expect(initialPref.onNewComment).toBe(true);
    expect(initialPref.emailDigestFreq).toBe('weekly');

    // 2. 업데이트 검증
    const updatedPref = await NotificationsService.updatePreferences(tempUserId, {
      onNewComment: false,
      emailDigestFreq: 'daily',
      emailAddress: 'notif_digest@crochub.dev'
    });

    expect(updatedPref.onNewComment).toBe(false);
    expect(updatedPref.emailDigestFreq).toBe('daily');
    expect(updatedPref.emailAddress).toBe('notif_digest@crochub.dev');

    // 3. 재조회 정합성 검증
    const reFetched = await NotificationsService.getPreferences(tempUserId);
    expect(reFetched.onNewComment).toBe(false);
    expect(reFetched.emailDigestFreq).toBe('daily');
  });
});
