import axios from 'axios';
import type { LocaleCode } from '../types/profile';
import type { ShowcaseItem, ShowcaseListResponse } from '../types/showcase';

const API_URL = '/api';

/**
 * 퍼블릭 쇼케이스 목록 조회
 */
export async function getShowcaseList(params: {
  locale?: LocaleCode;
  category?: string;
  featured?: boolean;
}): Promise<ShowcaseListResponse> {
  const response = await axios.get<ShowcaseListResponse>(`${API_URL}/showcase`, {
    params,
  });
  return response.data;
}

/**
 * 퍼블릭 쇼케이스 상세 조회 (슬러그 기준)
 */
export async function getShowcaseDetail(slug: string): Promise<ShowcaseItem> {
  const response = await axios.get<ShowcaseItem>(`${API_URL}/showcase/${slug}`);
  return response.data;
}

/**
 * 어드민 쇼케이스 등록
 */
export async function createShowcaseItem(item: Partial<ShowcaseItem>): Promise<ShowcaseItem> {
  const token = localStorage.getItem('token');
  const response = await axios.post<ShowcaseItem>(`${API_URL}/admin/showcase`, item, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * 어드민 쇼케이스 단건 조회 (ID 기준)
 */
export async function getAdminShowcaseItem(id: number): Promise<ShowcaseItem> {
  const token = localStorage.getItem('token');
  const response = await axios.get<ShowcaseItem>(`${API_URL}/admin/showcase/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * 어드민 쇼케이스 수정
 */
export async function updateShowcaseItem(id: number, item: Partial<ShowcaseItem>): Promise<ShowcaseItem> {
  const token = localStorage.getItem('token');
  const response = await axios.put<ShowcaseItem>(`${API_URL}/admin/showcase/${id}`, item, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

/**
 * 어드민 쇼케이스 삭제
 */
export async function deleteShowcaseItem(id: number): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_URL}/admin/showcase/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/**
 * 어드민 쇼케이스 순서 재배치
 */
export async function reorderShowcaseItems(ids: number[]): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.put(
    `${API_URL}/admin/showcase/reorder`,
    { ids },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
