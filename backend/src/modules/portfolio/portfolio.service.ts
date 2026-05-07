import { prisma } from '../../lib/prisma';
import { CreatePortfolioSectionDto, UpdatePortfolioSectionDto } from './portfolio.types';

/**
 * 포트폴리오 섹션 리스트 조회
 */
export async function getPortfolioSections(locale: 'ko' | 'en') {
  return await prisma.portfolioSection.findMany({
    where: { locale },
    orderBy: { order: 'asc' },
  });
}

/**
 * 단일 섹션 조회
 */
export async function getPortfolioSectionById(id: number) {
  return await prisma.portfolioSection.findUnique({
    where: { id },
  });
}

/**
 * 섹션 신규 생성 (어드민)
 */
export async function createPortfolioSection(data: CreatePortfolioSectionDto) {
  return await prisma.portfolioSection.create({
    data: {
      locale: data.locale,
      sectionKey: data.sectionKey,
      title: data.title,
      body: data.body ?? null,
      items: data.items as any,
      order: data.order ?? 0,
      isVisible: data.isVisible ?? true,
    },
  });
}

/**
 * 섹션 수정 (어드민)
 */
export async function updatePortfolioSection(id: number, data: UpdatePortfolioSectionDto) {
  return await prisma.portfolioSection.update({
    where: { id },
    data: {
      sectionKey: data.sectionKey,
      title: data.title,
      body: data.body === undefined ? undefined : data.body,
      items: data.items === undefined ? undefined : (data.items as any),
      order: data.order,
      isVisible: data.isVisible,
    },
  });
}

/**
 * 섹션 삭제 (어드민)
 */
export async function deletePortfolioSection(id: number) {
  return await prisma.portfolioSection.delete({
    where: { id },
  });
}

/**
 * 섹션 순서 재정렬 (어드민)
 */
export async function reorderPortfolioSections(ids: number[]) {
  return await prisma.$transaction(
    ids.map((id, index) =>
      prisma.portfolioSection.update({
        where: { id },
        data: { order: index },
      })
    )
  );
}
export { getPortfolioSections as getPortfolio };
