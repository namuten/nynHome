import axios from 'axios';
import type { LocaleCode } from '../types/profile';
import type { PortfolioResponse, PortfolioSection } from '../types/portfolio';

const API_URL = '/api';

/**
 * 퍼블릭 포트폴리오 섹션 목록 가져오기
 */
export async function getPortfolio(locale: LocaleCode): Promise<PortfolioResponse> {
  const response = await axios.get<PortfolioResponse>(`${API_URL}/portfolio`, {
    params: { locale },
  });
  return response.data;
}

/**
 * 어드민 포트폴리오 섹션 생성
 */
export async function createPortfolioSection(section: Partial<PortfolioSection>): Promise<PortfolioSection> {
  const token = localStorage.getItem('token');
  const response = await axios.post<PortfolioSection>(`${API_URL}/admin/portfolio/sections`, section, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * 어드민 포트폴리오 섹션 수정
 */
export async function updatePortfolioSection(id: number, section: Partial<PortfolioSection>): Promise<PortfolioSection> {
  const token = localStorage.getItem('token');
  const response = await axios.put<PortfolioSection>(`${API_URL}/admin/portfolio/sections/${id}`, section, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * 어드민 포트폴리오 섹션 삭제
 */
export async function deletePortfolioSection(id: number): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/admin/portfolio/sections/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * 어드민 포트폴리오 섹션 정렬 재조정
 */
export async function reorderPortfolioSections(ids: number[]): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.put(
    `${API_URL}/admin/portfolio/sections/reorder`,
    { ids },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
