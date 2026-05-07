import { PrismaClient } from '@prisma/client';
import { emailService, MockEmailAdapter } from '../src/services/email.service';
import { runEmailDigestJob, getCutoffDate } from '../src/jobs/emailDigest.job';

const prisma = new PrismaClient();

describe('Email Digest Integration Tests', () => {
  let mockAdapter: MockEmailAdapter;
  let testAdminId: number;
  let skipAdminId: number;

  beforeAll(async () => {
    // 1. 임시 테스트용 유저 계정 2개 생성
    const testAdmin = await prisma.user.create({
      data: {
        email: 'digest-active@crochub.test',
        passwordHash: 'securepassword',
        nickname: '다이제스트맨',
        role: 'admin',
      },
    });
    testAdminId = testAdmin.id;

    const skipAdmin = await prisma.user.create({
      data: {
        email: 'digest-skip@crochub.test',
        passwordHash: 'securepassword',
        nickname: '안받아용',
        role: 'admin',
      },
    });
    skipAdminId = skipAdmin.id;

    // 2. 알림 수신 동의 설정
    await prisma.notificationPreference.create({
      data: {
        adminUserId: testAdminId,
        emailDigestFreq: 'daily',
        emailAddress: 'digest-active@crochub.test',
      },
    });

    await prisma.notificationPreference.create({
      data: {
        adminUserId: skipAdminId,
        emailDigestFreq: 'never', // 절대 안 받음
        emailAddress: 'digest-skip@crochub.test',
      },
    });
  });

  afterAll(async () => {
    // 테스트 더미 데이터 일체 청소
    await prisma.notification.deleteMany({
      where: { userId: { in: [testAdminId, skipAdminId] } },
    });
    await prisma.notificationPreference.deleteMany({
      where: { adminUserId: { in: [testAdminId, skipAdminId] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testAdminId, skipAdminId] } },
    });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    // 3. 테스트 구동 전 메모리 Mock 어댑터 강제 대리 지정
    mockAdapter = new MockEmailAdapter();
    (emailService as any).adapter = mockAdapter;
  });

  it('should collect unsent notifications and send premium digest mail for eligible users', async () => {
    const now = new Date();

    // 다이제스트맨용 읽지 않은 알림 2건 적치
    await prisma.notification.createMany({
      data: [
        {
          userId: testAdminId,
          type: 'new_comment',
          title: '새로운 댓글 통보',
          body: '포트폴리오에 멋진 찬양 댓글이 달렸습니다.',
          isRead: false,
          createdAt: now,
        },
        {
          userId: testAdminId,
          type: 'new_guestbook',
          title: '신규 방명록 등록',
          body: '방명록에 따뜻한 격려가 남겨졌습니다.',
          isRead: false,
          createdAt: now,
        },
      ],
    });

    // 다이제스트 잡 수동 기동
    await runEmailDigestJob();

    // 4. 검증: 발송된 메일 목록 조사
    expect(mockAdapter.sentEmails.length).toBe(1);
    expect(mockAdapter.sentEmails[0].to).toBe('digest-active@crochub.test');
    expect(mockAdapter.sentEmails[0].subject).toContain('다이제스트맨');
    expect(mockAdapter.sentEmails[0].html).toContain('새로운 댓글 통보');
    expect(mockAdapter.sentEmails[0].html).toContain('신규 방명록 등록');

    // 5. 검증: 발송 마크 갱신 체크 (lastDigestSentAt이 기입되었는지 대조)
    const updatedPref = await prisma.notificationPreference.findUnique({
      where: { adminUserId: testAdminId },
    });
    expect(updatedPref?.lastDigestSentAt).not.toBeNull();
  });

  it('should skip processing users whose emailDigestFreq is set to never', async () => {
    // 안받아용 관리자에게 미읽음 알림을 주입하더라도 수신 주기가 never이므로 메일 전송이 전혀 일어나지 않아야 함
    await prisma.notification.create({
      data: {
        userId: skipAdminId,
        type: 'report_resolved',
        title: '신고 알림',
        body: '부적절한 댓글이 제보되었습니다.',
        isRead: false,
      },
    });

    // 다이제스트맨용 알림은 전부 처리되었고, 안받아용 유저만 알림이 남아있는 상황
    mockAdapter.clear();
    await runEmailDigestJob();

    // 검증: 수신 주기가 never인 관계로 메일 전송 리스트는 0건이어야 함
    expect(mockAdapter.sentEmails.length).toBe(0);
  });

  it('should support dynamic date difference cutoff 연산', () => {
    const fixedNow = new Date('2026-05-07T12:00:00Z');
    
    // lastSentAt이 없을 때 daily는 24시간 전 시점 연산 확인
    const dailyCutoff = getCutoffDate('daily', null);
    const timeDiff = Math.abs(new Date().getTime() - dailyCutoff.getTime() - 24 * 60 * 60 * 1000);
    expect(timeDiff).toBeLessThan(10000); // 10초 이내의 미세 연산 오차 허용

    // lastSentAt이 지정되어 있다면 우선적으로 lastSentAt 시점을 반환하는지 대조
    const lastSent = new Date('2026-05-06T08:00:00Z');
    const result = getCutoffDate('daily', lastSent);
    expect(result.getTime()).toBe(lastSent.getTime());
  });
});
