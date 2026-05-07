import { prisma } from '../../lib/prisma';
import { UpdateProfileDto } from './profile.types';

const DEFAULT_PROFILE = {
  ko: {
    displayName: '홍길동',
    tagline: '세상을 이롭게 하는 풀스택 개발자',
    bio: '안녕하세요! 예술과 기술의 조화를 사랑하는 개발자 홍길동입니다.',
    avatarUrl: '',
    coverImageUrl: '',
    school: '한국대학교',
    location: '서울, 대한민국',
    emailPublic: 'gildong@example.com',
    socialLinks: { github: 'https://github.com', instagram: 'https://instagram.com' },
    interests: ['프로그래밍', '디자인', '사진'],
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL'],
    achievements: [
      { title: '교내 정보올림피아드 금상', description: '알고리즘 및 문제 해결 능력 입증', date: '2025-10-15' },
      { title: '웹앱 공모전 우수상', description: 'React 기반의 지역 활성화 플랫폼 기획 및 개발', date: '2026-02-20' },
    ],
  },
  en: {
    displayName: 'John Doe',
    tagline: 'Full-stack developer who loves creating elegant solutions',
    bio: 'Hello! I am John Doe, a developer passionate about blending design and technology.',
    avatarUrl: '',
    coverImageUrl: '',
    school: 'Korea University',
    location: 'Seoul, South Korea',
    emailPublic: 'john.doe@example.com',
    socialLinks: { github: 'https://github.com', instagram: 'https://instagram.com' },
    interests: ['Coding', 'Design', 'Photography'],
    skills: ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL'],
    achievements: [
      { title: 'School Informatics Olympiad - Gold Medal', description: 'Proven algorithmic and problem-solving skills', date: '2025-10-15' },
      { title: 'Web App Contest - Excellence Award', description: 'Developed a React-based platform for regional activation', date: '2026-02-20' },
    ],
  },
};

/**
 * 프로필 조회
 */
export async function getProfile(locale: 'ko' | 'en') {
  const profile = await prisma.profileSettings.findUnique({
    where: { locale },
  });

  if (profile) {
    return profile;
  }

  // 데이터가 없을 경우 기본값 반환
  const defaultData = DEFAULT_PROFILE[locale] || DEFAULT_PROFILE.ko;
  return {
    id: 0,
    locale,
    ...defaultData,
    updatedAt: new Date(),
  };
}

/**
 * 프로필 수정 (어드민)
 */
export async function updateProfile(locale: 'ko' | 'en', data: UpdateProfileDto) {
  // Prisma Json 타입 필드 안전하게 처리하기 위해 cast
  const updateData = {
    displayName: data.displayName,
    tagline: data.tagline ?? null,
    bio: data.bio ?? null,
    avatarUrl: data.avatarUrl ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    school: data.school ?? null,
    location: data.location ?? null,
    emailPublic: data.emailPublic ?? null,
    socialLinks: data.socialLinks as any,
    interests: data.interests as any,
    skills: data.skills as any,
    achievements: data.achievements as any,
  };

  const profile = await prisma.profileSettings.upsert({
    where: { locale },
    update: updateData,
    create: {
      locale,
      ...updateData,
    },
  });

  return profile;
}

/**
 * 기본 씨드 데이터 생성
 */
export async function seedDefaultProfiles() {
  await prisma.profileSettings.upsert({
    where: { locale: 'ko' },
    update: {},
    create: {
      locale: 'ko',
      displayName: DEFAULT_PROFILE.ko.displayName,
      tagline: DEFAULT_PROFILE.ko.tagline,
      bio: DEFAULT_PROFILE.ko.bio,
      avatarUrl: DEFAULT_PROFILE.ko.avatarUrl,
      coverImageUrl: DEFAULT_PROFILE.ko.coverImageUrl,
      school: DEFAULT_PROFILE.ko.school,
      location: DEFAULT_PROFILE.ko.location,
      emailPublic: DEFAULT_PROFILE.ko.emailPublic,
      socialLinks: DEFAULT_PROFILE.ko.socialLinks as any,
      interests: DEFAULT_PROFILE.ko.interests as any,
      skills: DEFAULT_PROFILE.ko.skills as any,
      achievements: DEFAULT_PROFILE.ko.achievements as any,
    },
  });

  await prisma.profileSettings.upsert({
    where: { locale: 'en' },
    update: {},
    create: {
      locale: 'en',
      displayName: DEFAULT_PROFILE.en.displayName,
      tagline: DEFAULT_PROFILE.en.tagline,
      bio: DEFAULT_PROFILE.en.bio,
      avatarUrl: DEFAULT_PROFILE.en.avatarUrl,
      coverImageUrl: DEFAULT_PROFILE.en.coverImageUrl,
      school: DEFAULT_PROFILE.en.school,
      location: DEFAULT_PROFILE.en.location,
      emailPublic: DEFAULT_PROFILE.en.emailPublic,
      socialLinks: DEFAULT_PROFILE.en.socialLinks as any,
      interests: DEFAULT_PROFILE.en.interests as any,
      skills: DEFAULT_PROFILE.en.skills as any,
      achievements: DEFAULT_PROFILE.en.achievements as any,
    },
  });
}
