import { PrismaClient } from '@prisma/client';

function daysAfterPost(postCreatedAt: Date, n: number): Date {
  const d = new Date(postCreatedAt);
  d.setDate(d.getDate() + n);
  return d;
}

const COMMENT_DATA = [
  {
    postTitle: '봄 일러스트 시리즈 작업 과정',
    userEmail: 'sky_hani@example.com',
    body: '우와 그림 진짜 예쁘다 ㅠㅠ 어떤 앱 써요?',
    reply: '감사해요! Procreate 써요 😊 다음 작품도 기대해주세요!',
    daysAfter: 2,
  },
  {
    postTitle: '이달의 크로셰 작품 완성 🧶',
    userEmail: 'minji.draws@example.com',
    body: '크로셰 인형 너무 귀엽다 ㅠ 판매 안 해요?',
    reply: '아직 판매는 안 하고 있어요 ㅎㅎ 나중에 고려해볼게요!',
    daysAfter: 1,
  },
  {
    postTitle: '내가 쓰는 공부 루틴 공개',
    userEmail: 'suhyeon92@example.com',
    body: '공부 루틴 도움 많이 됐어요. 감사합니다 💜',
    reply: '도움이 됐다니 너무 기뻐요! 화이팅이에요 🌟',
    daysAfter: 3,
  },
  {
    postTitle: "I've been drawing every day for 30 days",
    userEmail: 'lena.music@example.com',
    body: 'I love your illustration style! So unique!',
    reply: 'Thank you so much! It means a lot 💜',
    daysAfter: 1,
  },
  {
    postTitle: '최애 플레이리스트 공유 🎵',
    userEmail: 'starboy_kr@example.com',
    body: '플레이리스트 취향 완전 저랑 똑같아요 ㅋㅋ',
    reply: '동생 생겼다 ㅋㅋ 다음 플리도 기대해줘요!',
    daysAfter: 2,
  },
  {
    postTitle: '음악으로 감정 풀어내기 — 피아노 커버',
    userEmail: 'jeunee04@example.com',
    body: '피아노 커버 어디서 들을 수 있어요?',
    reply: '포스트 안에 오디오 파일 올려뒀어요! 들어봐주세요 🎹',
    daysAfter: 4,
  },
  // No-reply comments
  {
    postTitle: '첫 디지털 드로잉 도전기',
    userEmail: 'ryu.tomy@example.com',
    body: '저도 아이패드 사고 싶어지네요 ㅠㅠ',
    reply: null,
    daysAfter: 5,
  },
  {
    postTitle: '요즘 읽고 있는 책들 추천',
    userEmail: 'milkyway_g@example.com',
    body: '아몬드 진짜 명작이죠 ㅠㅠ 저도 최애 책이에요',
    reply: null,
    daysAfter: 3,
  },
  {
    postTitle: '수학 점화식 완전 정복하기',
    userEmail: 'sky_hani@example.com',
    body: '점화식 진짜 어려운데 이렇게 정리해주니까 이해가 돼요!',
    reply: null,
    daysAfter: 2,
  },
  {
    postTitle: '영어 쉐도잉 30일 후기',
    userEmail: 'suhyeon92@example.com',
    body: '쉐도잉 저도 해봤는데 진짜 효과 있더라고요',
    reply: null,
    daysAfter: 1,
  },
  {
    postTitle: '봄비 오는 날의 카페 브이로그',
    userEmail: 'lena.music@example.com',
    body: '카페 감성 사진이 너무 예뻐요 🌧️',
    reply: null,
    daysAfter: 6,
  },
  {
    postTitle: 'Digital Art Tool 비교 후기',
    userEmail: 'jeunee04@example.com',
    body: 'Procreate 쓰고 싶은데 아이패드가 없어서... 언젠간 살 거예요',
    reply: null,
    daysAfter: 2,
  },
  {
    postTitle: '내가 만든 뜨개 인형들 모음',
    userEmail: 'milkyway_g@example.com',
    body: '토끼 제일 귀엽다 ㅠㅠ 도안 공유 안 해줘요?',
    reply: null,
    daysAfter: 3,
  },
  {
    postTitle: '2026 상반기 돌아보기',
    userEmail: 'starboy_kr@example.com',
    body: '반년 회고 보니까 저도 뭔가 해야겠다는 생각이 들어요',
    reply: null,
    daysAfter: 1,
  },
  {
    postTitle: '시험 전날 벼락치기 대신 이걸 해봤어',
    userEmail: 'ryu.tomy@example.com',
    body: '오답노트 정리가 진짜 효과 있죠 ㅠ 나도 해봐야겠다',
    reply: null,
    daysAfter: 2,
  },
];

export async function seedComments(prisma: PrismaClient): Promise<void> {
  for (const c of COMMENT_DATA) {
    const post = await prisma.post.findFirst({ where: { title: c.postTitle } });
    const user = await prisma.user.findUnique({ where: { email: c.userEmail } });
    if (!post || !user) continue;

    const existing = await prisma.comment.findFirst({
      where: { postId: post.id, userId: user.id, body: c.body },
    });
    if (existing) continue;

    const createdAt = daysAfterPost(post.createdAt, c.daysAfter);
    await prisma.comment.create({
      data: {
        postId: post.id,
        userId: user.id,
        body: c.body,
        reply: c.reply,
        createdAt,
      },
    });
  }
  console.log('✅ comments seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedComments(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
