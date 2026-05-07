import { prisma } from '../../lib/prisma';

/**
 * 미디어 파일이 실제 존재하는지 검증하는 도우미 함수
 */
async function validateMediaIds(coverMediaId?: number | null, mediaIds?: number[] | null) {
  if (coverMediaId) {
    const cover = await prisma.media.findUnique({ where: { id: coverMediaId } });
    if (!cover) {
      throw new Error('INVALID_MEDIA_ID');
    }
  }

  if (mediaIds && mediaIds.length > 0) {
    const count = await prisma.media.count({
      where: { id: { in: mediaIds } },
    });
    if (count !== mediaIds.length) {
      throw new Error('INVALID_MEDIA_ID');
    }
  }
}

/**
 * 포트폴리오 쇼케이스 아이템 전체 조회 (정렬 순)
 */
export async function getShowcaseItems(
  filters: { locale?: 'ko' | 'en'; category?: string; featured?: boolean },
  isPublic: boolean = true
) {
  const whereClause: any = {};

  if (isPublic) {
    whereClause.isPublished = true;
  }

  if (filters.locale) {
    whereClause.locale = filters.locale;
  }

  if (filters.category) {
    whereClause.category = filters.category;
  }

  if (filters.featured !== undefined) {
    whereClause.isFeatured = filters.featured;
  }

  return prisma.showcaseItem.findMany({
    where: whereClause,
    orderBy: { order: 'asc' },
  });
}

/**
 * 슬러그로 단일 쇼케이스 아이템 상세 조회
 */
export async function getShowcaseItemBySlug(slug: string, isPublic: boolean = true) {
  const item = await prisma.showcaseItem.findUnique({
    where: { slug },
  });

  if (!item) return null;
  if (isPublic && !item.isPublished) return null;

  return item;
}

/**
 * ID로 단일 쇼케이스 아이템 상세 조회
 */
export async function getShowcaseItemById(id: number) {
  return prisma.showcaseItem.findUnique({
    where: { id },
  });
}

/**
 * 신규 쇼케이스 아이템 생성
 */
export async function createShowcaseItem(data: any) {
  // 1. 슬러그 중복 확인
  const existing = await prisma.showcaseItem.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    throw new Error('SLUG_DUPLICATE');
  }

  // 2. 미디어 유효성 검증
  await validateMediaIds(data.coverMediaId, data.mediaIds);

  // 3. 게시 날짜 자동 설정
  let publishedAt: Date | null = null;
  if (data.isPublished) {
    publishedAt = new Date();
  }

  // 4. 데이터베이스 저장
  return prisma.showcaseItem.create({
    data: {
      ...data,
      publishedAt,
    },
  });
}

/**
 * 쇼케이스 아이템 수정
 */
export async function updateShowcaseItem(id: number, data: any) {
  // 1. 기존 데이터 조회
  const item = await prisma.showcaseItem.findUnique({ where: { id } });
  if (!item) {
    throw new Error('NOT_FOUND');
  }

  // 2. 슬러그 변경 시 중복 체크
  if (data.slug && data.slug !== item.slug) {
    const duplicate = await prisma.showcaseItem.findUnique({
      where: { slug: data.slug },
    });
    if (duplicate) {
      throw new Error('SLUG_DUPLICATE');
    }
  }

  // 3. 미디어 변경 시 유효성 검증
  const nextCover = data.coverMediaId !== undefined ? data.coverMediaId : item.coverMediaId;
  const nextMediaIds = data.mediaIds !== undefined ? data.mediaIds : (item.mediaIds as number[]);
  await validateMediaIds(nextCover, nextMediaIds);

  // 4. 게시 처리 날짜 전환
  let publishedAt = item.publishedAt;
  if (data.isPublished !== undefined) {
    if (data.isPublished && !item.isPublished) {
      publishedAt = new Date();
    } else if (!data.isPublished) {
      publishedAt = null;
    }
  }

  return prisma.showcaseItem.update({
    where: { id },
    data: {
      ...data,
      publishedAt,
    },
  });
}

/**
 * 쇼케이스 아이템 삭제
 */
export async function deleteShowcaseItem(id: number) {
  return prisma.showcaseItem.delete({
    where: { id },
  });
}

/**
 * 단일 트랜잭션 내 일괄 순서 정렬
 */
export async function reorderShowcaseItems(ids: number[]) {
  return prisma.$transaction(
    ids.map((id, index) =>
      prisma.showcaseItem.update({
        where: { id },
        data: { order: index },
      })
    )
  );
}
