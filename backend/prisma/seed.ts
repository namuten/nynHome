import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@crochub.dev';
  const password = process.env.ADMIN_PASSWORD ?? 'change-me-in-production';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, nickname: 'Admin', role: 'admin' },
  });

  const defaultTypes = [
    { mimeType: 'image/jpeg', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'image/png', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'image/webp', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'image/gif', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'image/avif', fileCategory: 'image', maxSizeMb: 20 },
    { mimeType: 'video/mp4', fileCategory: 'video', maxSizeMb: 500 },
    { mimeType: 'video/quicktime', fileCategory: 'video', maxSizeMb: 500 },
    { mimeType: 'video/webm', fileCategory: 'video', maxSizeMb: 500 },
    { mimeType: 'audio/mpeg', fileCategory: 'audio', maxSizeMb: 50 },
    { mimeType: 'audio/wav', fileCategory: 'audio', maxSizeMb: 50 },
    { mimeType: 'audio/flac', fileCategory: 'audio', maxSizeMb: 50 },
    { mimeType: 'audio/ogg', fileCategory: 'audio', maxSizeMb: 50 },
    { mimeType: 'application/pdf', fileCategory: 'document', maxSizeMb: 30 },
    {
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      fileCategory: 'document',
      maxSizeMb: 30,
    },
    {
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileCategory: 'document',
      maxSizeMb: 30,
    },
  ];

  for (const type of defaultTypes) {
    await prisma.mediaTypeConfig.upsert({
      where: { mimeType: type.mimeType },
      update: {},
      create: type,
    });
  }

  console.log('✅ Seed complete — admin:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
