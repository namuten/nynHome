import api from './api';
import type { LocaleCode, ProfileSettings } from '../types/profile';

/**
 * 프로필 조회 (Public)
 */
export async function getProfile(locale: LocaleCode = 'ko'): Promise<ProfileSettings> {
  const response = await api.get<ProfileSettings>('/profile', { params: { locale } });
  return response.data;
}

/**
 * 어드민 프로필 수정 (Admin)
 */
export async function updateAdminProfile(locale: LocaleCode, payload: Partial<ProfileSettings>): Promise<ProfileSettings> {
  const response = await api.put<ProfileSettings>(`/admin/profile/${locale}`, payload);
  return response.data;
}
