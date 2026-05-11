import { PrismaClient } from '@prisma/client';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const ENTRIES = [
  { email: 'sky_hani@example.com', body: '항상 응원해! 네 그림 볼 때마다 진짜 힐링돼 🌸', daysAgo: 78 },
  { email: 'minji.draws@example.com', body: '오늘도 잘 보고 갑니다. 음악 취향 완전 제 스타일이에요', daysAgo: 70 },
  { email: 'lena.music@example.com', body: 'I love your art style! Keep it up 💜', daysAgo: 65 },
  { email: 'suhyeon92@example.com', body: '크로셰 작품들 너무 예쁘다... 나도 배워보고 싶어', daysAgo: 58 },
  { email: 'starboy_kr@example.com', body: '블로그 감성 너무 좋아요. 자주 올게요!', daysAgo: 52 },
  { email: 'jeunee04@example.com', body: '수학 포스트 덕분에 점화식 이해했어요 감사해요 🙏', daysAgo: 45 },
  { email: 'ryu.tomy@example.com', body: '봄 일러스트 배경화면으로 쓰고 싶다 ㅠㅠ', daysAgo: 40 },
  { email: 'milkyway_g@example.com', body: '나연아 화이팅!! 항상 응원해 💜💜', daysAgo: 35 },
  { email: 'sky_hani@example.com', body: 'Your creativity inspires me every day!', daysAgo: 30 },
  { email: 'minji.draws@example.com', body: '방명록 처음 남겨보는데 앞으로 자주 올게요', daysAgo: 25 },
  { email: 'lena.music@example.com', body: '오늘 처음 왔는데 완전 제 취향이에요. 자주 올게요 ✨', daysAgo: 20 },
  { email: 'suhyeon92@example.com', body: '그림 색감이 너무 예뻐요. 어떻게 공부하셨어요?', daysAgo: 15 },
  { email: 'starboy_kr@example.com', body: '크로셰 인형 만드는 과정 영상도 올려주세요 🥹', daysAgo: 10 },
  { email: 'jeunee04@example.com', body: '나연님 블로그 보면 나도 뭔가 하고 싶어져요', daysAgo: 5 },
  { email: 'ryu.tomy@example.com', body: '감성 충전하고 갑니다 🌿 다음 포스팅도 기대할게요!', daysAgo: 2 },
];

export async function seedGuestbook(prisma: PrismaClient): Promise<void> {
  for (const e of ENTRIES) {
    const user = await prisma.user.findUnique({ where: { email: e.email } });
    if (!user) continue;
    const existing = await prisma.guestbookEntry.findFirst({
      where: { userId: user.id, body: e.body },
    });
    if (existing) continue;
    await prisma.guestbookEntry.create({
      data: { userId: user.id, body: e.body, createdAt: daysAgo(e.daysAgo) },
    });
  }
  console.log('✅ guestbook seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedGuestbook(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
