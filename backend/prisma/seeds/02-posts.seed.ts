import { PrismaClient } from '@prisma/client';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const POSTS = [
  // creative (6)
  {
    title: '첫 디지털 드로잉 도전기',
    body: '오늘 처음으로 Procreate로 그림을 그려봤어요. 손가락으로 그리는 게 이렇게 어려울 줄은 몰랐네요. 레이어 기능이 처음엔 헷갈렸지만 한 시간 쯤 지나니까 감이 오더라고요. 완성된 그림은 좀 어색하지만 뭔가 뿌듯한 느낌이에요. 다음엔 더 잘할 수 있을 것 같아요!',
    category: 'creative' as const,
    isPublished: true,
    viewCount: 312,
    createdAt: daysAgo(85),
    tagSlugs: ['geurim', 'digital-art', 'illustration'],
  },
  {
    title: '이달의 크로셰 작품 완성 🧶',
    body: '드디어 곰돌이 인형을 완성했어요! 눈알 달기가 제일 어려웠고 귀를 붙이는 게 생각보다 오래 걸렸어요. 실 색깔은 라벤더+아이보리 조합으로 했는데 너무 귀엽게 나온 것 같아서 기뻐요. 다음 작품은 토끼로 도전해볼 계획이에요.',
    category: 'creative' as const,
    isPublished: true,
    viewCount: 245,
    createdAt: daysAgo(72),
    tagSlugs: ['crochet-kr', 'diy', 'creative'],
  },
  {
    title: '음악으로 감정 풀어내기 — 피아노 커버',
    body: '요즘 기분이 복잡할 때마다 피아노 앞에 앉아서 쳐요. 오늘 커버한 곡은 IU 언니의 "밤편지"예요. 원래 코드가 어렵지 않아서 연습하기 좋은 곡이에요. 녹음해서 올려봤는데 제 감정이 잘 담겼으면 좋겠어요. 피아노 소리가 저한테 제일 큰 위로가 되는 것 같아요.',
    category: 'creative' as const,
    isPublished: true,
    viewCount: 189,
    createdAt: daysAgo(60),
    tagSlugs: ['eumak', 'music', 'gamseong'],
  },
  {
    title: '봄 일러스트 시리즈 작업 과정',
    body: '봄 시리즈 3번째 작품을 작업 중이에요. 이번엔 벚꽃 아래 앉아있는 고양이를 그리고 있어요. 배경색은 연한 분홍에서 보라로 그라데이션 처리했고, 고양이 털 표현이 제일 신경 쓰이는 부분이에요. 작업 과정 영상도 같이 올릴 계획이에요!',
    category: 'creative' as const,
    isPublished: true,
    viewCount: 401,
    createdAt: daysAgo(45),
    tagSlugs: ['geurim', 'illustration', 'creative'],
  },
  {
    title: '내가 만든 뜨개 인형들 모음',
    body: '올해 만든 뜨개 인형들을 한 자리에 모아봤어요. 곰돌이, 토끼, 고양이, 강아지까지 총 4개! 처음엔 기본 도안을 따라했는데 이제는 눈, 코, 귀 위치를 제 스타일로 바꿔서 만들고 있어요. 다음엔 도안을 직접 짜보고 싶어요.',
    category: 'creative' as const,
    isPublished: true,
    viewCount: 178,
    createdAt: daysAgo(30),
    tagSlugs: ['crochet-kr', 'diy', 'healing'],
  },
  {
    title: 'Digital Art Tool 비교 후기',
    body: 'Procreate vs Clip Studio vs Medibang — 세 가지 앱을 써보면서 느낀 점을 정리해봤어요. 개인적으로는 iPad에서 Procreate가 제일 자연스럽게 느껴졌어요. 레이어 블렌딩 모드랑 브러쉬 커스터마이징이 직관적이거든요. 입문자라면 무료인 Medibang부터 시작하는 걸 추천해요.',
    category: 'creative' as const,
    isPublished: true,
    viewCount: 356,
    createdAt: daysAgo(18),
    tagSlugs: ['digital-art', 'drawing', 'creative'],
  },
  // blog (5)
  {
    title: '요즘 읽고 있는 책들 추천',
    body: '요즘 독서 클럽 덕분에 책을 꽤 많이 읽게 됐어요. 이번 달엔 "채식주의자"와 "아몬드"를 읽었는데 둘 다 강추예요. 특히 아몬드는 감정을 느끼지 못하는 주인공 이야기라서 저랑 완전 반대인데도 공감이 많이 됐어요. 다음 달엔 영어 원서에도 도전해보려고요.',
    category: 'blog' as const,
    isPublished: true,
    viewCount: 134,
    createdAt: daysAgo(78),
    tagSlugs: ['dokseo-grok', 'daily', 'gamseong'],
  },
  {
    title: '봄비 오는 날의 카페 브이로그',
    body: '오늘 비가 너무 예쁘게 내려서 혼자 카페에 갔어요. 창가 자리에 앉아서 라떼 한 잔이랑 스케치북 펴놓고 그림 그렸어요. 비 소리랑 재즈 음악이 같이 들리는데 집중이 엄청 잘 됐어요. 이런 날 혼자 카페 가는 게 제 소확행이에요.',
    category: 'blog' as const,
    isPublished: true,
    viewCount: 221,
    createdAt: daysAgo(55),
    tagSlugs: ['ilsang', 'daily', 'healing'],
  },
  {
    title: '최애 플레이리스트 공유 🎵',
    body: '집중할 때, 그림 그릴 때, 잠 잘 때 — 각각 다른 플레이리스트를 쓰거든요. 집중용엔 Lo-fi 힙합 믹스, 그림 그릴 때는 시티팝, 잠 잘 때는 스튜디오 지브리 오케스트라예요. Spotify 공유 링크 올려두었으니까 같이 들어요! 취향 맞으면 팔로우해주세요.',
    category: 'blog' as const,
    isPublished: true,
    viewCount: 298,
    createdAt: daysAgo(40),
    tagSlugs: ['eumak', 'music', 'gamseong'],
  },
  {
    title: '2026 상반기 돌아보기',
    body: '2026년이 벌써 반이 지나갔네요. 올해 목표 중에 달성한 게 뭐가 있나 돌아봤어요. 크로셰 4개 완성 ✅, 30일 그림 챌린지 ✅, 독서 클럽 6권 ✅, 피아노 커버 녹음 ✅. 생각보다 열심히 살았네요. 하반기엔 영어 원서 2권 읽기에 도전할 거예요.',
    category: 'blog' as const,
    isPublished: true,
    viewCount: 167,
    createdAt: daysAgo(10),
    tagSlugs: ['ilsang', 'daily', 'gamseong'],
  },
  {
    title: 'I\'ve been drawing every day for 30 days',
    body: 'I challenged myself to draw something — anything — every single day for 30 days. Some days it was a quick doodle in the margins of my notebook. Other days I spent three hours on a full illustration. What surprised me most was how quickly my hand got more confident. By day 20 I stopped second-guessing every line. If you\'re thinking about starting: just begin. The first drawing doesn\'t have to be good.',
    category: 'blog' as const,
    isPublished: true,
    viewCount: 423,
    createdAt: daysAgo(5),
    tagSlugs: ['drawing', 'daily', 'creative'],
  },
  // study (4)
  {
    title: '수학 점화식 완전 정복하기',
    body: '점화식이 이해가 안 돼서 유튜브 강의를 세 개나 봤어요. 결국 핵심은 "현재 항을 이전 항으로 표현하기"인데, 거기다가 등차·등비 패턴을 연결하면 대부분 풀려요. 오늘은 an = an-1 + d 꼴과 an = r × an-1 꼴을 중심으로 정리했어요. 예제 10개 풀고 나서야 눈에 들어오더라고요.',
    category: 'study' as const,
    isPublished: true,
    viewCount: 289,
    createdAt: daysAgo(70),
    tagSlugs: ['suhak', 'study', 'gongbubob'],
  },
  {
    title: '영어 쉐도잉 30일 후기',
    body: '매일 15분씩 영어 팟캐스트를 따라 말하는 쉐도잉을 30일간 해봤어요. 처음엔 발음이 너무 달라서 창피했는데, 2주쯤 지나니까 리듬감이 붙는 느낌이 왔어요. 모르는 단어는 넘기고 일단 소리를 따라 하는 게 핵심이에요. 독해보다 말하기 실력이 훨씬 빨리 늘었어요.',
    category: 'study' as const,
    isPublished: true,
    viewCount: 312,
    createdAt: daysAgo(50),
    tagSlugs: ['yeongeo', 'study', 'gongbubob'],
  },
  {
    title: '내가 쓰는 공부 루틴 공개',
    body: '학교 끝나고 집에 오면 딱 20분 쉬어요. 그다음 수학 30분, 영어 30분, 나머지 과목 40분 순서로 해요. 타이머 쓰는 게 진짜 중요해요. 시간이 정해지면 그 안에 집중하게 되거든요. 밤 10시 이후엔 억지로 하지 않고 그림이나 독서로 마무리해요.',
    category: 'study' as const,
    isPublished: true,
    viewCount: 445,
    createdAt: daysAgo(25),
    tagSlugs: ['gongbubob', 'study', 'ilsang'],
  },
  {
    title: '시험 전날 벼락치기 대신 이걸 해봤어',
    body: '시험 전날에 새로운 내용 공부하면 오히려 역효과라는 걸 이번에 체감했어요. 대신 오답노트 훑기 + 마인드맵으로 전체 흐름 정리 + 일찍 자기 — 이 세 가지만 했더니 오히려 더 잘 나왔어요. 벼락치기로 밤 새는 것보다 컨디션 관리가 훨씬 중요한 것 같아요.',
    category: 'study' as const,
    isPublished: true,
    viewCount: 388,
    createdAt: daysAgo(8),
    tagSlugs: ['gongbubob', 'study', 'suhak'],
  },
];

export async function seedPosts(prisma: PrismaClient): Promise<void> {
  for (const { tagSlugs, createdAt, ...postData } of POSTS) {
    let post = await prisma.post.findFirst({ where: { title: postData.title } });
    if (!post) {
      post = await prisma.post.create({ data: { ...postData, createdAt } });
    }

    for (const slug of tagSlugs) {
      const tag = await prisma.tag.findUnique({ where: { slug } });
      if (!tag) continue;
      await prisma.contentTag.upsert({
        where: { tagId_contentType_contentId: { tagId: tag.id, contentType: 'post', contentId: post.id } },
        update: {},
        create: { tagId: tag.id, contentType: 'post', contentId: post.id },
      });
    }
  }
  console.log('✅ posts + content_tags seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedPosts(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
