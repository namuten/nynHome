# Sample Data Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inject realistic sample data across all CrocHub features for functional verification and production-like appearance.

**Architecture:** 15 domain-specific seed modules under `backend/prisma/seeds/`, each exporting a function accepting a shared PrismaClient instance, orchestrated by `index.ts` in dependency order. The existing `seed.ts` (admin user + MediaTypeConfig) is unchanged.

**Tech Stack:** TypeScript, Prisma Client v5, bcryptjs, ts-node, MySQL

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `backend/prisma/seeds/index.ts` | Orchestrator — imports and calls all 15 seed functions |
| Create | `backend/prisma/seeds/00-users.seed.ts` | 8 visitor user accounts |
| Create | `backend/prisma/seeds/01-tags.seed.ts` | 20 tags (12 KO + 8 EN) |
| Create | `backend/prisma/seeds/02-posts.seed.ts` | 15 posts + ContentTag links |
| Create | `backend/prisma/seeds/03-media.seed.ts` | 20 media records (picsum URLs) |
| Create | `backend/prisma/seeds/04-comments.seed.ts` | 15 comments, 6 with admin replies |
| Create | `backend/prisma/seeds/05-guestbook.seed.ts` | 15 guestbook entries |
| Create | `backend/prisma/seeds/06-schedule.seed.ts` | 12 calendar events |
| Create | `backend/prisma/seeds/07-profile.seed.ts` | ProfileSettings ko + en |
| Create | `backend/prisma/seeds/08-portfolio.seed.ts` | 6 PortfolioSection records |
| Create | `backend/prisma/seeds/09-showcase.seed.ts` | 6 ShowcaseItem records |
| Create | `backend/prisma/seeds/10-collections.seed.ts` | 4 collections + CollectionItem links |
| Create | `backend/prisma/seeds/11-layout.seed.ts` | 3 ContentLayout sections |
| Create | `backend/prisma/seeds/12-seo.seed.ts` | 8 SeoSettings (ko/en × 4 routes) |
| Create | `backend/prisma/seeds/13-analytics.seed.ts` | 90 DailyAnalyticsRollup records |
| Create | `backend/prisma/seeds/14-notifications.seed.ts` | 10 Notification records |
| Modify | `backend/package.json` | Add `seed:sample` and `seed:all` scripts |

---

## Task 0: Add package.json Scripts

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Add the two new scripts**

In `backend/package.json`, add to the `"scripts"` object:

```json
"seed:sample": "ts-node prisma/seeds/index.ts",
"seed:all": "npx prisma db seed && ts-node prisma/seeds/index.ts"
```

The full `scripts` block becomes:

```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "test": "jest --runInBand --forceExit",
  "test:local": "jest --runInBand --forceExit",
  "db:migrate": "prisma migrate dev",
  "db:seed": "ts-node prisma/seed.ts",
  "seed:sample": "ts-node prisma/seeds/index.ts",
  "seed:all": "npx prisma db seed && ts-node prisma/seeds/index.ts"
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/package.json
git commit -m "chore(seed): add seed:sample and seed:all npm scripts"
```

---

## Task 1: Seed Users (00-users.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/00-users.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const SAMPLE_USERS = [
  { email: 'sky_hani@example.com', nickname: '하늘이' },
  { email: 'minji.draws@example.com', nickname: 'minji_art' },
  { email: 'suhyeon92@example.com', nickname: '수현 언니' },
  { email: 'lena.music@example.com', nickname: 'Lena' },
  { email: 'starboy_kr@example.com', nickname: '별빛소년' },
  { email: 'jeunee04@example.com', nickname: '이지은' },
  { email: 'ryu.tomy@example.com', nickname: 'tomato_boy' },
  { email: 'milkyway_g@example.com', nickname: '은하수' },
];

export async function seedUsers(prisma: PrismaClient): Promise<void> {
  const passwordHash = await bcrypt.hash('sample1234!', 10);
  for (const u of SAMPLE_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, passwordHash, nickname: u.nickname, role: 'user' },
    });
  }
  console.log('✅ users seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedUsers(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify it works**

```bash
cd backend
npx ts-node prisma/seeds/00-users.seed.ts
```

Expected output:
```
✅ users seeded
```

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/00-users.seed.ts
git commit -m "feat(seed): add sample visitor users seed"
```

---

## Task 2: Seed Tags (01-tags.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/01-tags.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';

const TAGS = [
  { name: '그림', slug: 'geurim', color: '#6844c7' },
  { name: '디지털아트', slug: 'digital-art', color: '#7c3aed' },
  { name: '음악', slug: 'eumak', color: '#8b5cf6' },
  { name: '일상', slug: 'ilsang', color: '#a78bfa' },
  { name: '감성', slug: 'gamseong', color: '#9333ea' },
  { name: '독서기록', slug: 'dokseo-grok', color: '#7e22ce' },
  { name: '공부법', slug: 'gongbubob', color: '#6d28d9' },
  { name: '수학', slug: 'suhak', color: '#5b21b6' },
  { name: '영어', slug: 'yeongeo', color: '#4c1d95' },
  { name: '크로셰', slug: 'crochet-kr', color: '#a855f7' },
  { name: 'DIY', slug: 'diy', color: '#c084fc' },
  { name: '힐링', slug: 'healing', color: '#d8b4fe' },
  { name: 'Drawing', slug: 'drawing', color: '#7c3aed' },
  { name: 'Music', slug: 'music', color: '#8b5cf6' },
  { name: 'Study', slug: 'study', color: '#6d28d9' },
  { name: 'Creative', slug: 'creative', color: '#9333ea' },
  { name: 'Daily', slug: 'daily', color: '#a78bfa' },
  { name: 'Illustration', slug: 'illustration', color: '#7e22ce' },
  { name: 'Poetry', slug: 'poetry', color: '#6844c7' },
  { name: 'Film', slug: 'film', color: '#5b21b6' },
];

export async function seedTags(prisma: PrismaClient): Promise<void> {
  for (const tag of TAGS) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }
  console.log('✅ tags seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedTags(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/01-tags.seed.ts
```

Expected: `✅ tags seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/01-tags.seed.ts
git commit -m "feat(seed): add 20 sample tags seed"
```

---

## Task 3: Seed Posts + ContentTags (02-posts.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/02-posts.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/02-posts.seed.ts
```

Expected: `✅ posts + content_tags seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/02-posts.seed.ts
git commit -m "feat(seed): add 15 sample posts with content tag links"
```

---

## Task 4: Seed Media (03-media.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/03-media.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/03-media.seed.ts
```

Expected: `✅ media seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/03-media.seed.ts
git commit -m "feat(seed): add 20 sample media records (images, audio, docs)"
```

---

## Task 5: Seed Comments (04-comments.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/04-comments.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/04-comments.seed.ts
```

Expected: `✅ comments seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/04-comments.seed.ts
git commit -m "feat(seed): add 15 sample comments with admin replies"
```

---

## Task 6: Seed Guestbook (05-guestbook.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/05-guestbook.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/05-guestbook.seed.ts
```

Expected: `✅ guestbook seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/05-guestbook.seed.ts
git commit -m "feat(seed): add 15 sample guestbook entries"
```

---

## Task 7: Seed Schedules (06-schedule.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/06-schedule.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';

function offset(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function offsetEnd(days: number, hours = 2): Date {
  const d = offset(days);
  d.setHours(hours, 0, 0, 0);
  return d;
}

const SCHEDULES = [
  { title: '기말고사', startAt: offset(-60), endAt: offsetEnd(-58, 18), color: '#ef4444' },
  { title: '미술 동아리 전시회', startAt: offset(-45), endAt: offsetEnd(-44, 17), color: '#8b5cf6' },
  { title: '봄 일러스트 완성 마감', startAt: offset(-30), endAt: offsetEnd(-30, 23), color: '#6844c7' },
  { title: '독서 클럽 모임', startAt: offset(-14), endAt: offsetEnd(-14, 16), color: '#10b981' },
  { title: '피아노 연습', startAt: offset(-1), endAt: offsetEnd(-1, 19), color: '#f59e0b' },
  { title: '블로그 포스팅 마감', startAt: offset(0), endAt: offsetEnd(0, 23), color: '#6844c7' },
  { title: '친구 생일 파티 🎉', startAt: offset(5), endAt: offsetEnd(5, 21), color: '#ec4899' },
  { title: '수행평가 제출', startAt: offset(10), endAt: offsetEnd(10, 17), color: '#ef4444' },
  { title: '크로셰 작품 촬영', startAt: offset(14), endAt: offsetEnd(14, 16), color: '#8b5cf6' },
  { title: '여름 일러스트 기획', startAt: offset(21), endAt: offsetEnd(21, 20), color: '#6844c7' },
  { title: '음악 커버 녹음', startAt: offset(28), endAt: offsetEnd(28, 18), color: '#f59e0b' },
  { title: '방학 시작 🏖️', startAt: offset(45), endAt: offsetEnd(46, 23), color: '#10b981' },
];

export async function seedSchedules(prisma: PrismaClient): Promise<void> {
  for (const s of SCHEDULES) {
    const existing = await prisma.schedule.findFirst({ where: { title: s.title } });
    if (existing) continue;
    await prisma.schedule.create({ data: s });
  }
  console.log('✅ schedules seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedSchedules(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/06-schedule.seed.ts
```

Expected: `✅ schedules seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/06-schedule.seed.ts
git commit -m "feat(seed): add 12 sample calendar schedules"
```

---

## Task 8: Seed Profile (07-profile.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/07-profile.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';

const PROFILES = [
  {
    locale: 'ko',
    displayName: '나연',
    tagline: '그림·음악·글로 세상을 채우는 중 🎨🎵✍️',
    bio: '안녕하세요! 그림 그리고, 음악 듣고, 글 쓰는 걸 좋아하는 고1 나연이에요. 이 공간에 제가 만든 것들과 일상을 조금씩 담아가고 있어요. 크로셰 인형, 디지털 드로잉, 피아노 커버까지 — 뭐든 만들어보는 중이에요 🧶',
    school: '○○고등학교 1학년',
    location: 'Seoul, Korea',
    interests: ['디지털아트', '음악', '독서', '크로셰', '영화'],
    skills: ['Procreate', 'Notion', '기타', '뜨개질', '글쓰기'],
    achievements: [
      { title: '교내 미술대회 입선', date: '2025-11-01' },
      { title: '독서 클럽 우수 회원', date: '2025-12-01' },
    ],
    socialLinks: {
      instagram: 'https://instagram.com/nayeon.creates',
      github: 'https://github.com/nayeon-dev',
    },
  },
  {
    locale: 'en',
    displayName: 'Nayeon',
    tagline: 'Filling the world with art, music & words 🎨',
    bio: "Hi! I'm Nayeon, a high school student who loves drawing, making music, and writing. This is my little corner of the internet where I share my creations and daily life.",
    school: 'High School, Grade 10',
    location: 'Seoul, Korea',
    interests: ['Digital Art', 'Music', 'Reading', 'Crochet', 'Film'],
    skills: ['Procreate', 'Digital Illustration', 'Guitar', 'Creative Writing'],
    achievements: [
      { title: 'School Art Contest — Honorable Mention', date: '2025-11-01' },
      { title: 'Book Club Outstanding Member', date: '2025-12-01' },
    ],
    socialLinks: {
      instagram: 'https://instagram.com/nayeon.creates',
      github: 'https://github.com/nayeon-dev',
    },
  },
];

export async function seedProfile(prisma: PrismaClient): Promise<void> {
  for (const p of PROFILES) {
    await prisma.profileSettings.upsert({
      where: { locale: p.locale },
      update: p,
      create: p,
    });
  }
  console.log('✅ profile seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedProfile(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/07-profile.seed.ts
```

Expected: `✅ profile seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/07-profile.seed.ts
git commit -m "feat(seed): add ko/en profile settings"
```

---

## Task 9: Seed Portfolio (08-portfolio.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/08-portfolio.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';

const SECTIONS = [
  {
    locale: 'ko',
    sectionKey: 'education',
    title: '학력',
    order: 0,
    isVisible: true,
    items: [
      { title: '○○고등학교', subtitle: '재학 중', date: '2026-03 ~ 현재', desc: '예술 동아리 활동, 독서 클럽 소속' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'awards',
    title: '수상 & 인정',
    order: 1,
    isVisible: true,
    items: [
      { title: '교내 미술대회 입선', subtitle: '○○고등학교', date: '2025-11', desc: '디지털 일러스트 부문' },
      { title: '독서 클럽 우수 회원', subtitle: '○○고등학교 독서 클럽', date: '2025-12', desc: '연간 독서량 기준 선정' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'projects',
    title: '프로젝트',
    order: 2,
    isVisible: true,
    items: [
      { title: '크로셰 인형 시리즈', subtitle: 'DIY & 핸드크래프트', date: '2025-09 ~ 현재', desc: '곰돌이·토끼·고양이 등 4종 완성, 직접 도안 개발 중' },
      { title: '음악 커버 EP', subtitle: '피아노 & 기타', date: '2026-01 ~ 현재', desc: 'IU·뉴진스 등 6곡 커버 녹음, 포스트에 공개' },
      { title: 'CrocHub 개인 홈페이지', subtitle: 'Full-Stack Web', date: '2025-12 ~ 현재', desc: 'React + Node.js + MySQL 기반 포트폴리오 + 블로그 사이트' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'activities',
    title: '활동',
    order: 3,
    isVisible: true,
    items: [
      { title: '미술 동아리 (부장)', subtitle: '○○고등학교', date: '2026-03 ~ 현재', desc: '전시 기획 및 디지털 아트 워크숍 진행' },
      { title: '독서 클럽', subtitle: '○○고등학교', date: '2025-09 ~ 현재', desc: '월 1회 모임, 연간 12권 목표' },
      { title: '지역 어린이 미술 봉사', subtitle: '지역 도서관', date: '2025-11', desc: '어린이 대상 드로잉 수업 보조' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'skills',
    title: '스킬',
    order: 4,
    isVisible: true,
    items: [
      { title: 'Procreate', subtitle: '디지털 아트', date: null, desc: '일러스트, 캐릭터 디자인' },
      { title: '기타 & 피아노', subtitle: '음악', date: null, desc: '코드 반주, 커버 연주' },
      { title: '뜨개질 (크로셰)', subtitle: 'DIY', date: null, desc: '인형 도안 독해, 제작' },
      { title: 'Notion', subtitle: '생산성', date: null, desc: '일정 관리, 독서 노트' },
    ],
  },
  {
    locale: 'ko',
    sectionKey: 'goals',
    title: '목표',
    order: 5,
    isVisible: true,
    body: '예술 관련 전공 진학을 목표로 창작 활동을 꾸준히 이어가고 있어요. 디지털 아트와 음악, 글쓰기를 통해 나만의 세계를 만들어나가는 것이 가장 큰 꿈이에요.',
    items: [
      { title: '예술 계열 대학 진학', subtitle: '장기 목표', date: null, desc: '디자인 또는 미디어아트 전공' },
      { title: '개인 작품집 제작', subtitle: '2026 하반기', date: null, desc: '디지털 & 크래프트 작품 한데 모아 출판' },
    ],
  },
];

export async function seedPortfolio(prisma: PrismaClient): Promise<void> {
  for (const s of SECTIONS) {
    const existing = await prisma.portfolioSection.findFirst({
      where: { locale: s.locale, sectionKey: s.sectionKey },
    });
    if (existing) continue;
    await prisma.portfolioSection.create({ data: s });
  }
  console.log('✅ portfolio sections seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedPortfolio(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/08-portfolio.seed.ts
```

Expected: `✅ portfolio sections seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/08-portfolio.seed.ts
git commit -m "feat(seed): add 6 portfolio sections"
```

---

## Task 10: Seed Showcase (09-showcase.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/09-showcase.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const ITEMS = [
  {
    title: 'Spring Illustration Series',
    slug: 'spring-illust-2026',
    description: '2026년 봄 테마로 작업한 디지털 일러스트 시리즈. 벚꽃, 고양이, 봄비 등 계절 감성을 담았어요.',
    category: 'Digital Art',
    locale: 'ko',
    tags: ['geurim', 'digital-art', 'illustration'],
    isFeatured: true,
    isPublished: true,
    publishedAt: daysAgo(45),
    order: 0,
  },
  {
    title: 'Rainy Days — Piano Covers EP',
    slug: 'rainy-days-ep',
    description: '빗소리와 어울리는 피아노 커버 6곡 모음. IU, 뉴진스, 아이유 원곡을 나만의 감성으로 편곡했어요.',
    category: 'Music',
    locale: 'ko',
    tags: ['eumak', 'music', 'gamseong'],
    isFeatured: true,
    isPublished: true,
    publishedAt: daysAgo(30),
    order: 1,
  },
  {
    title: '크로셰 인형 컬렉션 Vol.1',
    slug: 'crochet-collection-vol1',
    description: '손으로 직접 만든 뜨개 인형 4종 — 곰돌이, 토끼, 고양이, 강아지. 각자 도안 개발 과정 포함.',
    category: 'DIY & Craft',
    locale: 'ko',
    tags: ['crochet-kr', 'diy', 'creative'],
    isFeatured: false,
    isPublished: true,
    publishedAt: daysAgo(20),
    order: 2,
  },
  {
    title: '일러스트 캐릭터 제작기',
    slug: 'character-design-process',
    description: '나만의 캐릭터 "크로미"를 디자인하는 과정을 담은 작업 노트. 컬러 팔레트 선정부터 최종 완성까지.',
    category: 'Digital Art',
    locale: 'ko',
    tags: ['geurim', 'illustration', 'creative'],
    isFeatured: false,
    isPublished: true,
    publishedAt: daysAgo(15),
    order: 3,
  },
  {
    title: '내가 쓴 시 모음',
    slug: 'poetry-collection',
    description: '일상에서 느낀 감정을 짧은 시로 담아낸 컬렉션. 봄, 비, 음악, 그리움을 주제로 10편을 모았어요.',
    category: 'Writing',
    locale: 'ko',
    tags: ['poetry', 'gamseong', 'ilsang'],
    isFeatured: false,
    isPublished: true,
    publishedAt: daysAgo(10),
    order: 4,
  },
  {
    title: 'CrocHub — 개인 홈페이지 개발',
    slug: 'crochub-web',
    description: 'React + Node.js + MySQL로 제작한 개인 홈페이지 프로젝트. 포트폴리오, 블로그, 미디어 라이브러리를 통합한 풀스택 웹 앱.',
    category: 'Full-Stack Web',
    locale: 'ko',
    tags: ['creative'],
    isFeatured: false,
    isPublished: true,
    publishedAt: daysAgo(5),
    order: 5,
  },
];

export async function seedShowcase(prisma: PrismaClient): Promise<void> {
  for (const item of ITEMS) {
    await prisma.showcaseItem.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  }
  console.log('✅ showcase items seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedShowcase(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/09-showcase.seed.ts
```

Expected: `✅ showcase items seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/09-showcase.seed.ts
git commit -m "feat(seed): add 6 showcase items"
```

---

## Task 11: Seed Collections (10-collections.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/10-collections.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';

export async function seedCollections(prisma: PrismaClient): Promise<void> {
  // 봄 감성 모음 — creative posts
  const springColl = await getOrCreateCollection(prisma, {
    title: '봄 감성 모음 🌸',
    description: '봄 테마의 창작 콘텐츠 모음',
    isPublished: true,
  });
  const creativePosts = await prisma.post.findMany({
    where: { category: 'creative', isPublished: true },
    orderBy: { createdAt: 'asc' },
    take: 5,
  });
  for (let i = 0; i < creativePosts.length; i++) {
    await upsertCollectionItem(prisma, springColl.id, 'post', creativePosts[i].id, i);
  }

  // 공부 기록 아카이브 — study posts
  const studyColl = await getOrCreateCollection(prisma, {
    title: '공부 기록 아카이브 📚',
    description: '수학, 영어, 공부법 게시글 모음',
    isPublished: true,
  });
  const studyPosts = await prisma.post.findMany({
    where: { category: 'study', isPublished: true },
    orderBy: { createdAt: 'asc' },
  });
  for (let i = 0; i < studyPosts.length; i++) {
    await upsertCollectionItem(prisma, studyColl.id, 'post', studyPosts[i].id, i);
  }

  // 음악·감성 플레이리스트 — blog posts
  const musicColl = await getOrCreateCollection(prisma, {
    title: '음악·감성 플레이리스트 🎵',
    description: '음악과 감성이 담긴 블로그 게시글',
    isPublished: true,
  });
  const blogPosts = await prisma.post.findMany({
    where: { category: 'blog', isPublished: true },
    orderBy: { viewCount: 'desc' },
    take: 3,
  });
  for (let i = 0; i < blogPosts.length; i++) {
    await upsertCollectionItem(prisma, musicColl.id, 'post', blogPosts[i].id, i);
  }

  // 작품 포트폴리오 — showcase items (contentType: 'portfolio_item')
  const portfolioColl = await getOrCreateCollection(prisma, {
    title: '작품 포트폴리오 ✨',
    description: '나연의 대표 창작 작품들',
    isPublished: true,
  });
  const showcaseItems = await prisma.showcaseItem.findMany({
    where: { isFeatured: true, isPublished: true },
    orderBy: { order: 'asc' },
  });
  for (let i = 0; i < showcaseItems.length; i++) {
    await upsertCollectionItem(prisma, portfolioColl.id, 'portfolio_item', showcaseItems[i].id, i);
  }

  console.log('✅ collections seeded');
}

async function getOrCreateCollection(
  prisma: PrismaClient,
  data: { title: string; description: string; isPublished: boolean }
) {
  const existing = await prisma.collection.findFirst({ where: { title: data.title } });
  if (existing) return existing;
  return prisma.collection.create({ data });
}

async function upsertCollectionItem(
  prisma: PrismaClient,
  collectionId: number,
  contentType: string,
  contentId: number,
  position: number
) {
  await prisma.collectionItem.upsert({
    where: { collectionId_contentType_contentId: { collectionId, contentType, contentId } },
    update: { position },
    create: { collectionId, contentType, contentId, position },
  });
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedCollections(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/10-collections.seed.ts
```

Expected: `✅ collections seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/10-collections.seed.ts
git commit -m "feat(seed): add 4 collections with content item links"
```

---

## Task 12: Seed Layout (11-layout.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/11-layout.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';

export async function seedLayout(prisma: PrismaClient): Promise<void> {
  // featured: top 3 most-viewed posts
  const featured = await prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: 'desc' },
    take: 3,
  });

  // recent_creative: latest 4 creative posts
  const recentCreative = await prisma.post.findMany({
    where: { category: 'creative', isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  // recent_blog: latest 3 blog posts
  const recentBlog = await prisma.post.findMany({
    where: { category: 'blog', isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const sections = [
    { sectionKey: 'featured', postIds: featured.map((p) => p.id), order: 0 },
    { sectionKey: 'recent_creative', postIds: recentCreative.map((p) => p.id), order: 1 },
    { sectionKey: 'recent_blog', postIds: recentBlog.map((p) => p.id), order: 2 },
  ];

  for (const s of sections) {
    await prisma.contentLayout.deleteMany({ where: { sectionKey: s.sectionKey } });
    await prisma.contentLayout.create({
      data: {
        sectionKey: s.sectionKey,
        postIds: s.postIds,
        order: s.order,
        isVisible: true,
      },
    });
  }

  console.log('✅ content layout seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedLayout(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/11-layout.seed.ts
```

Expected: `✅ content layout seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/11-layout.seed.ts
git commit -m "feat(seed): add 3 content layout sections"
```

---

## Task 13: Seed SEO (12-seo.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/12-seo.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';

const SEO = [
  {
    routeKey: 'home', locale: 'ko',
    title: '나연의 크리에이티브 공간 — CrocHub',
    description: '그림, 음악, 글로 채우는 나연의 개인 홈페이지',
    keywords: ['디지털아트', '일러스트', '음악', '크로셰', '나연'],
  },
  {
    routeKey: 'home', locale: 'en',
    title: "Nayeon's Creative Space — CrocHub",
    description: 'A personal homepage filled with art, music & words',
    keywords: ['digital art', 'illustration', 'music', 'crochet', 'Nayeon'],
  },
  {
    routeKey: 'portfolio', locale: 'ko',
    title: '포트폴리오 — 나연',
    description: '나연의 작품과 프로젝트 모음',
    keywords: ['포트폴리오', '일러스트', '크로셰', '음악 커버'],
  },
  {
    routeKey: 'portfolio', locale: 'en',
    title: 'Portfolio — Nayeon',
    description: "A collection of Nayeon's works and projects",
    keywords: ['portfolio', 'illustration', 'crochet', 'music cover'],
  },
  {
    routeKey: 'blog', locale: 'ko',
    title: '블로그 — 나연의 일상과 생각',
    description: '일상, 감성, 책, 음악 이야기',
    keywords: ['블로그', '일상', '독서', '음악', '감성'],
  },
  {
    routeKey: 'blog', locale: 'en',
    title: "Blog — Nayeon's daily life & thoughts",
    description: 'Daily life, music, books, and more',
    keywords: ['blog', 'daily', 'reading', 'music'],
  },
  {
    routeKey: 'study', locale: 'ko',
    title: '공부 기록 — 나연',
    description: '수학, 영어, 공부 루틴 공유',
    keywords: ['공부', '수학', '영어', '공부법', '고등학생'],
  },
  {
    routeKey: 'study', locale: 'en',
    title: 'Study Notes — Nayeon',
    description: 'Math, English, and study tips',
    keywords: ['study', 'math', 'english', 'high school'],
  },
];

export async function seedSeo(prisma: PrismaClient): Promise<void> {
  for (const s of SEO) {
    await prisma.seoSettings.upsert({
      where: { routeKey_locale: { routeKey: s.routeKey, locale: s.locale } },
      update: s,
      create: s,
    });
  }
  console.log('✅ SEO settings seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedSeo(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/12-seo.seed.ts
```

Expected: `✅ SEO settings seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/12-seo.seed.ts
git commit -m "feat(seed): add 8 SEO settings (ko/en x 4 routes)"
```

---

## Task 14: Seed Analytics (13-analytics.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/13-analytics.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
import { PrismaClient } from '@prisma/client';

// Post upload dates (days ago) that trigger traffic spikes
const SPIKE_DAYS = new Set([5, 8, 10, 18, 25, 30, 45, 50, 55, 60, 70, 72, 78, 85]);

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedAnalytics(prisma: PrismaClient): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDay = new Date(today);
  startDay.setDate(startDay.getDate() - 30);

  const endDay = new Date(today);
  endDay.setDate(endDay.getDate() - 1);

  // Clear previous sample data for this range
  await prisma.dailyAnalyticsRollup.deleteMany({
    where: { day: { gte: startDay, lte: endDay } },
  });

  const records = [];
  for (let i = 30; i >= 1; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);

    const isSpike = SPIKE_DAYS.has(i);
    const weekend = isWeekend(day);

    const baseCount = isSpike ? rand(100, 150) : weekend ? rand(40, 80) : rand(15, 40);
    const baseSessions = isSpike ? rand(70, 110) : weekend ? rand(30, 60) : rand(10, 30);

    records.push(
      { day, route: '/', eventName: 'page_view', count: baseCount, uniqueSessions: baseSessions },
      { day, route: '/post', eventName: 'post_view', count: Math.floor(baseCount * 0.6), uniqueSessions: Math.floor(baseSessions * 0.6) },
      { day, route: '/guestbook', eventName: 'guestbook_visit', count: Math.floor(baseCount * 0.2), uniqueSessions: Math.floor(baseSessions * 0.2) }
    );
  }

  await prisma.dailyAnalyticsRollup.createMany({ data: records });
  console.log(`✅ analytics seeded (${records.length} records)`);
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedAnalytics(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/13-analytics.seed.ts
```

Expected: `✅ analytics seeded (90 records)`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/13-analytics.seed.ts
git commit -m "feat(seed): add 90 daily analytics rollup records (30 days)"
```

---

## Task 15: Seed Notifications (14-notifications.seed.ts)

**Files:**
- Create: `backend/prisma/seeds/14-notifications.seed.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Run to verify**

```bash
npx ts-node prisma/seeds/14-notifications.seed.ts
```

Expected: `✅ notifications seeded`

- [ ] **Step 3: Commit**

```bash
git add backend/prisma/seeds/14-notifications.seed.ts
git commit -m "feat(seed): add 10 sample notifications"
```

---

## Task 16: Orchestrator (index.ts)

**Files:**
- Create: `backend/prisma/seeds/index.ts`

- [ ] **Step 1: Create the orchestrator**

```typescript
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './00-users.seed';
import { seedTags } from './01-tags.seed';
import { seedPosts } from './02-posts.seed';
import { seedMedia } from './03-media.seed';
import { seedComments } from './04-comments.seed';
import { seedGuestbook } from './05-guestbook.seed';
import { seedSchedules } from './06-schedule.seed';
import { seedProfile } from './07-profile.seed';
import { seedPortfolio } from './08-portfolio.seed';
import { seedShowcase } from './09-showcase.seed';
import { seedCollections } from './10-collections.seed';
import { seedLayout } from './11-layout.seed';
import { seedSeo } from './12-seo.seed';
import { seedAnalytics } from './13-analytics.seed';
import { seedNotifications } from './14-notifications.seed';

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('🌱 Starting sample data seed...\n');
    await seedUsers(prisma);
    await seedTags(prisma);
    await seedPosts(prisma);
    await seedMedia(prisma);
    await seedComments(prisma);
    await seedGuestbook(prisma);
    await seedSchedules(prisma);
    await seedProfile(prisma);
    await seedPortfolio(prisma);
    await seedShowcase(prisma);
    await seedCollections(prisma);
    await seedLayout(prisma);
    await seedSeo(prisma);
    await seedAnalytics(prisma);
    await seedNotifications(prisma);
    console.log('\n✅ All sample data seeded successfully!');
  } catch (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

- [ ] **Step 2: Run the full orchestrator end-to-end**

```bash
cd backend
npm run seed:sample
```

Expected output (approximately):
```
🌱 Starting sample data seed...

✅ users seeded
✅ tags seeded
✅ posts + content_tags seeded
✅ media seeded
✅ comments seeded
✅ guestbook seeded
✅ schedules seeded
✅ profile seeded
✅ portfolio sections seeded
✅ showcase items seeded
✅ collections seeded
✅ content layout seeded
✅ SEO settings seeded
✅ analytics seeded (90 records)
✅ notifications seeded

✅ All sample data seeded successfully!
```

- [ ] **Step 3: Run a second time to verify idempotency**

```bash
npm run seed:sample
```

Expected: Identical output with no errors, no duplicate rows.

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/seeds/index.ts
git commit -m "feat(seed): add seed orchestrator (index.ts) — runs all 15 domain seeds in order"
```

---

## Task 17: Final Verification

These are manual spot-checks in the running application. Run the development environment first:

```bash
# Terminal 1 — start the stack
cd /path/to/nynHome
docker compose up -d db
cd backend && npm run dev
```

- [ ] **Check 1: Run seed:all (admin seed + sample seed together)**

```bash
cd backend
npm run seed:all
```

Expected: Admin seed completes first, then all 15 sample modules run without error.

- [ ] **Check 2: Database row counts (run in MySQL or via Prisma Studio)**

```bash
cd backend
npx prisma studio
```

Open `http://localhost:5555` and verify approximate counts:

| Table | Expected rows |
|-------|--------------|
| users | 9+ (1 admin + 8 sample) |
| tags | 20+ |
| posts | 15 |
| media | 20 |
| comments | 15 |
| guestbook_entries | 15 |
| schedules | 12 |
| profile_settings | 2 |
| portfolio_sections | 6 |
| showcase_items | 6 |
| collections | 4+ |
| collection_items | 10+ |
| content_layout | 3 |
| seo_settings | 8 |
| daily_analytics_rollups | 90 |
| notifications | 13+ (3 from old seed + 10 new) |
| content_tags | 30+ |

- [ ] **Check 3: Commit final verification note**

```bash
git commit --allow-empty -m "chore(seed): verify sample data seed complete — all 15 modules idempotent"
```

---

## Running on Production Server

After merging this branch, run on the production server via SSH:

```bash
# On production server
cd /app/backend
docker compose exec api npm run seed:all
# or if running directly:
NODE_ENV=production npm run seed:all
```

Ensure the production `DATABASE_URL` env var is set before running.
