import { PrismaClient } from '@prisma/client';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const NOTIFICATIONS = [
  { type: 'new_comment', title: "새 댓글: '그림 진짜 예쁘다 ㅠㅠ'", body: '하늘이 님이 "봄 일러스트 시리즈 작업 과정" 포스트에 댓글을 남겼어요.', linkUrl: '/admin/comments', isRead: true, createdAt: daysAgo(28) },
  { type: 'new_comment', title: "새 댓글: '크로셰 인형 판매 안 해요?'", body: 'minji_art 님이 "이달의 크로셰 작품 완성 🧶"에 댓글을 남겼어요.', linkUrl: '/admin/comments', isRead: true, createdAt: daysAgo(25) },
  { type: 'new_guestbook', title: "방명록: '항상 응원해! 💜'", body: '하늘이 님이 방명록에 응원 메시지를 남겼어요.', linkUrl: '/guestbook', isRead: true, createdAt: daysAgo(22) },
  { type: 'new_guestbook', title: "방명록: 'I love your art style!'", body: 'Lena 님이 방명록에 메시지를 남겼어요.', linkUrl: '/guestbook', isRead: true, createdAt: daysAgo(18) },
  { type: 'new_guestbook', title: "방명록: '수학 포스트 덕분에 이해했어요'", body: '이지은 님이 방명록에 감사 메시지를 남겼어요.', linkUrl: '/guestbook', isRead: true, createdAt: daysAgo(15) },
  { type: 'report_resolved', title: '신고 처리 완료: 스팸 댓글 숨김 처리됨', body: '접수된 댓글 신고가 검토 완료되어 해당 댓글이 숨김 처리되었어요.', linkUrl: '/admin/moderation', isRead: true, createdAt: daysAgo(12) },
  { type: 'broadcast', title: '시스템: SSL 인증서 갱신 완료', body: 'Let\'s Encrypt SSL 인증서가 성공적으로 갱신되었습니다.', linkUrl: null, isRead: true, createdAt: daysAgo(10) },
  { type: 'new_comment', title: "새 댓글: '플레이리스트 취향 저격이에요'", body: '별빛소년 님이 "최애 플레이리스트 공유 🎵"에 댓글을 남겼어요.', linkUrl: '/admin/comments', isRead: false, createdAt: daysAgo(3) },
  { type: 'new_guestbook', title: "방명록: '나연아 화이팅!! 💜💜'", body: '은하수 님이 방명록에 응원 메시지를 남겼어요.', linkUrl: '/guestbook', isRead: false, createdAt: daysAgo(1) },
  { type: 'new_comment', title: "새 댓글: '피아노 커버 어디서 들어요?'", body: '이지은 님이 "음악으로 감정 풀어내기"에 댓글을 남겼어요.', linkUrl: '/admin/comments', isRead: false, createdAt: daysAgo(0) },
];

export async function seedNotifications(prisma: PrismaClient): Promise<void> {
  for (const n of NOTIFICATIONS) {
    const existing = await prisma.notification.findFirst({ where: { title: n.title } });
    if (existing) continue;
    await prisma.notification.create({ data: { ...n, userId: null } });
  }
  console.log('✅ notifications seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedNotifications(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
