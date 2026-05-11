import { api } from './api';
import type { LocaleCode } from '../types/profile';
import type { SeoSettings } from '../types/seo';

/**
 * public SEO 설정 조회
 */
export async function getSeoSettings(routeKey: string, locale: LocaleCode): Promise<SeoSettings> {
  const response = await api.get<SeoSettings>('/seo', {
    params: { routeKey, locale },
  });
  return response.data;
}

/**
 * 어드민 SEO 설정 추가/수정
 */
export async function updateSeoSettings(
  routeKey: string,
  data: Partial<SeoSettings>
): Promise<SeoSettings> {
  const response = await api.put<SeoSettings>(`/admin/seo/${routeKey}`, data);
  return response.data;
}
