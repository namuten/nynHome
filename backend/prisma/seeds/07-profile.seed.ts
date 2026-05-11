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
      update: {},
      create: p,
    });
  }
  console.log('✅ profile seeded');
}

if (require.main === module) {
  const prisma = new PrismaClient();
  seedProfile(prisma).catch(console.error).finally(() => prisma.$disconnect());
}
