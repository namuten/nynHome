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
