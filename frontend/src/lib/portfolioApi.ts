import { api } from './api';
import type { LocaleCode } from '../types/profile';
import type { PortfolioResponse, PortfolioSection } from '../types/portfolio';

/**
 * 퍼블릭 포트폴리오 섹션 목록 가져오기
 */
export async function getPortfolio(locale: LocaleCode): Promise<PortfolioResponse> {
  const response = await api.get<PortfolioResponse>('/portfolio', {
    params: { locale },
  });
  return response.data;
}

/**
 * 어드민 포트폴리오 섹션 생성
 */
export async function createPortfolioSection(section: Partial<PortfolioSection>): Promise<PortfolioSection> {
  const response = await api.post<PortfolioSection>('/admin/portfolio/sections', section);
  return response.data;
}

/**
 * 어드민 포트폴리오 섹션 수정
 */
export async function updatePortfolioSection(id: number, section: Partial<PortfolioSection>): Promise<PortfolioSection> {
  const response = await api.put<PortfolioSection>(`/admin/portfolio/sections/${id}`, section);
  return response.data;
}

/**
 * 어드민 포트폴리오 섹션 삭제
 */
export async function deletePortfolioSection(id: number): Promise<void> {
  await api.delete(`/admin/portfolio/sections/${id}`);
}

/**
 * 어드민 포트폴리오 섹션 정렬 재조정
 */
export async function reorderPortfolioSections(ids: number[]): Promise<void> {
  await api.put('/admin/portfolio/sections/reorder', { ids });
}
