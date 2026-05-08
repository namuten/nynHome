import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedDefaultProfiles } from '../src/modules/profile/profile.service';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@crochub.dev';
  const password = process.env.ADMIN_PASSWORD ?? 'change-me-in-production';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { role: 'admin', passwordHash },
    create: { email, passwordHash, nickname: 'Admin', role: 'admin' },
  });

  // 기본 프로필 씨드 추가
  await seedDefaultProfiles();

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

  // Plan 10 샘플 태그 씨드 추가
  const sampleTags = [
    { name: 'Full-Stack Web', slug: 'full-stack-web', color: '#3b82f6' },
    { name: '3D Graphics', slug: '3d-graphics', color: '#8b5cf6' },
    { name: 'Algorithm', slug: 'algorithm', color: '#10b981' },
  ];
  for (const tag of sampleTags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    });
  }

  // Plan 10 샘플 컬렉션 씨드 추가
  const sampleCollections = [
    { title: '대표 포트폴리오', description: '가장 주력으로 하는 개인 및 팀 프로젝트 모음', isPublished: true },
    { title: '디자인 영감 모음', description: '감각을 넓혀주는 수려한 아트워크 아카이브', isPublished: true },
    { title: '알고리즘 정복기', description: '꾸준한 문제 해결 노력과 생각 정리', isPublished: true },
  ];
  for (const coll of sampleCollections) {
    const existing = await prisma.collection.findFirst({
      where: { title: coll.title },
    });
    if (!existing) {
      await prisma.collection.create({
        data: coll,
      });
    }
  }

  // Plan 10 샘플 알림 씨드 추가
  const sampleNotifications = [
    { type: 'new_comment', title: '새로운 댓글 알림', body: '포트폴리오 게시물에 새로운 감상 댓글이 등록되었습니다.', linkUrl: '/admin/comments' },
    { type: 'new_guestbook', title: '방명록 등록 알림', body: '공개 방명록에 새로운 응원 메세지가 도착했습니다.', linkUrl: '/guestbook' },
    { type: 'report_resolved', title: '신고 검토 결과 알림', body: '운영진 검사 큐에 접수되었던 댓글 리포트의 처리가 결정되었습니다.', linkUrl: '/admin/moderation' },
  ];
  for (const notif of sampleNotifications) {
    const existing = await prisma.notification.findFirst({
      where: { title: notif.title },
    });
    if (!existing) {
      await prisma.notification.create({
        data: notif,
      });
    }
  }

  console.log('✅ Seed complete — admin:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
