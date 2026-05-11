import { PrismaClient } from '@prisma/client';

const POST_TITLES = [
  '첫 디지털 드로잉 도전기',
  '이달의 크로셰 작품 완성 🧶',
  '음악으로 감정 풀어내기 — 피아노 커버',
  '봄 일러스트 시리즈 작업 과정',
  '내가 만든 뜨개 인형들 모음',
  'Digital Art Tool 비교 후기',
  '요즘 읽고 있는 책들 추천',
  '봄비 오는 날의 카페 브이로그',
  '최애 플레이리스트 공유 🎵',
  '2026 상반기 돌아보기',
  "I've been drawing every day for 30 days",
  '수학 점화식 완전 정복하기',
  '영어 쉐도잉 30일 후기',
  '내가 쓰는 공부 루틴 공개',
  '시험 전날 벼락치기 대신 이걸 해봤어',
];

const IMAGE_SEEDS = [
  'digital-drawing', 'crochet-bear', 'piano-cover', 'spring-illust',
  'crochet-collection', 'art-tool', 'books', 'cafe-vlog',
  'playlist', 'half-year', 'drawing-30days', 'math-study',
  'english-shadow', 'study-routine', 'exam-prep',
];

const AUDIO_FILES = [
  {
    fileName: 'piano-cover-midnight.mp3',
    fileUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
    duration: 180,
  },
  {
    fileName: 'guitar-session-spring.mp3',
    fileUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
    duration: 213,
  },
  {
    fileName: 'ambient-study-mix.mp3',
    fileUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
    duration: 240,
  },
];

const DOC_FILES = [
  {
    fileName: 'portfolio-2026.pdf',
    fileUrl: 'https://pub.crochub.dev/docs/portfolio-2026.pdf',
  },
  {
    fileName: 'study-notes-math.pdf',
    fileUrl: 'https://pub.crochub.dev/docs/study-notes-math.pdf',
  },
];

export async function seedMedia(prisma: PrismaClient): Promise<void> {
  // Images — one per post
  for (let i = 0; i < IMAGE_SEEDS.length; i++) {
    const seed = IMAGE_SEEDS[i];
    const fileName = `${seed}.jpg`;
    const existing = await prisma.media.findFirst({ where: { fileName } });
    if (existing) continue;

    const post = await prisma.post.findFirst({ where: { title: POST_TITLES[i] } });
    const fileSize = BigInt(100000 + Math.floor(Math.random() * 400000));
    await prisma.media.create({
      data: {
        postId: post?.id ?? null,
        fileUrl: `https://picsum.photos/seed/${seed}/800/600`,
        mimeType: 'image/jpeg',
        fileCategory: 'image',
        fileName,
        fileSize,
        width: 800,
        height: 600,
      },
    });
  }

  // Audio files
  for (const audio of AUDIO_FILES) {
    const existing = await prisma.media.findFirst({ where: { fileName: audio.fileName } });
    if (existing) continue;
    await prisma.media.create({
      data: {
        postId: null,
        fileUrl: audio.fileUrl,
        mimeType: 'audio/mpeg',
        fileCategory: 'audio',
        fileName: audio.fileName,
        fileSize: BigInt(3000000 + Math.floor(Math.random() * 2000000)),
        duration: audio.duration,
      },
    });
  }

  // Documents
  for (const doc of DOC_FILES) {
    const existing = await prisma.media.findFirst({ where: { fileName: doc.fileName } });
    if (existing) continue;
    await prisma.media.create({
      data: {
        postId: null,
        fileUrl: doc.fileUrl,
        mimeType: 'application/pdf',
        fileCategory: 'document',
        fileName: doc.fileName,
        fileSize: BigInt(500000 + Math.floor(Math.random() * 1000000)),
      },
    });
  }

  console.log('✅ media seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedMedia(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
