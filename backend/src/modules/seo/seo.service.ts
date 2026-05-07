import { PrismaClient } from '@prisma/client';
import type { UpdateSeoBody } from './seo.types';

const prisma = new PrismaClient();

// 기본 뼈대 Fallback 세팅
const getDefaultSeo = (routeKey: string, locale: 'ko' | 'en') => {
  if (locale === 'en') {
    return {
      routeKey,
      locale: 'en',
      title: 'CrocHub | Tech Portfolio & Blog',
      description: 'The creative engineering portfolio, technical devlogs, 3D graphics sandbox, and full-stack software achievements.',
      ogImageUrl: null,
      keywords: ['CrocHub', 'Tech Blog', 'WebGL', 'Portfolio', 'Full-Stack'],
    };
  }
  return {
    routeKey,
    locale: 'ko',
    title: 'CrocHub | 크록허브 개발자 포트폴리오',
    description: '크록허브의 고품격 소프트웨어 엔지니어링 성과, 3D WebGL 디자인 연구소, 테크 블로그 및 개발 아카이브.',
    ogImageUrl: null,
    keywords: ['크록허브', '개발 블로그', 'WebGL', '포트폴리오', '풀스택'],
  };
};

/**
 * SEO 설정 단건 조회 (기본 Fallback 탑재)
 */
export async function getSeoSettings(routeKey: string, locale: 'ko' | 'en' = 'ko') {
  // 1. 타겟 언어로 시도
  let seo = await prisma.seoSettings.findUnique({
    where: {
      routeKey_locale: { routeKey, locale },
    },
  });

  // 2. 검색 실패 시 한국어('ko') 세팅으로 일차 Fallback
  if (!seo && locale !== 'ko') {
    seo = await prisma.seoSettings.findUnique({
      where: {
        routeKey_locale: { routeKey, locale: 'ko' },
      },
    });
  }

  // 3. 여전히 없거나 처음 호출일 시 기본 하드코딩 사양 제공
  if (!seo) {
    return getDefaultSeo(routeKey, locale);
  }

  return {
    ...seo,
    keywords: Array.isArray(seo.keywords) ? seo.keywords as string[] : [],
  };
}

/**
 * 어드민 전용 SEO 설정 신규 저장 및 갱신 (Upsert)
 */
export async function updateSeoSettings(routeKey: string, data: UpdateSeoBody) {
  const seo = await prisma.seoSettings.upsert({
    where: {
      routeKey_locale: { routeKey, locale: data.locale },
    },
    update: {
      title: data.title,
      description: data.description,
      ogImageUrl: data.ogImageUrl || null,
      keywords: (data.keywords || undefined) as any,
    },
    create: {
      routeKey,
      locale: data.locale,
      title: data.title,
      description: data.description,
      ogImageUrl: data.ogImageUrl || null,
      keywords: (data.keywords || undefined) as any,
    },
  });

  return {
    ...seo,
    keywords: Array.isArray(seo.keywords) ? seo.keywords as string[] : [],
  };
}
