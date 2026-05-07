import axios from 'axios';
import type { LocaleCode } from '../types/profile';
import type { SeoSettings } from '../types/seo';

const API_URL = '/api';

/**
 * public SEO 설정 조회
 */
export async function getSeoSettings(routeKey: string, locale: LocaleCode): Promise<SeoSettings> {
  const response = await axios.get<SeoSettings>(`${API_URL}/seo`, {
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
  const token = localStorage.getItem('token');
  const response = await axios.put<SeoSettings>(`${API_URL}/admin/seo/${routeKey}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
