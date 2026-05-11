import { api } from './api';
import type { LocaleCode } from '../types/profile';
import type { ShowcaseItem, ShowcaseListResponse } from '../types/showcase';

/**
 * 퍼블릭 쇼케이스 목록 조회
 */
export async function getShowcaseList(params: {
  locale?: LocaleCode;
  category?: string;
  featured?: boolean;
}): Promise<ShowcaseListResponse> {
  const response = await api.get<ShowcaseListResponse>('/showcase', {
    params,
  });
  return response.data;
}

/**
 * 퍼블릭 쇼케이스 상세 조회 (슬러그 기준)
 */
export async function getShowcaseDetail(slug: string): Promise<ShowcaseItem> {
  const response = await api.get<ShowcaseItem>(`/showcase/${slug}`);
  return response.data;
}

/**
 * 어드민 쇼케이스 등록
 */
export async function createShowcaseItem(item: Partial<ShowcaseItem>): Promise<ShowcaseItem> {
  const response = await api.post<ShowcaseItem>('/admin/showcase', item);
  return response.data;
}

/**
 * 어드민 쇼케이스 단건 조회 (ID 기준)
 */
export async function getAdminShowcaseItem(id: number): Promise<ShowcaseItem> {
  const response = await api.get<ShowcaseItem>(`/admin/showcase/${id}`);
  return response.data;
}

/**
 * 어드민 쇼케이스 수정
 */
export async function updateShowcaseItem(id: number, item: Partial<ShowcaseItem>): Promise<ShowcaseItem> {
  const response = await api.put<ShowcaseItem>(`/admin/showcase/${id}`, item);
  return response.data;
}

/**
 * 어드민 쇼케이스 삭제
 */
export async function deleteShowcaseItem(id: number): Promise<void> {
  await api.delete(`/admin/showcase/${id}`);
}

/**
 * 어드민 쇼케이스 순서 재배치
 */
export async function reorderShowcaseItems(ids: number[]): Promise<void> {
  await api.put('/admin/showcase/reorder', { ids });
}
