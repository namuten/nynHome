import api from './api';
import type { LocaleCode, ProfileSettings } from '../types/profile';
import type { PortfolioResponse, PortfolioSection } from '../types/portfolio';
import type { ShowcaseItem, ShowcaseDetail, ShowcaseCategory } from '../types/showcase';
import type { SeoSettings } from '../types/seo';

/**
 * 1. Profile / Branding API
 */
export async function getProfile(locale: LocaleCode = 'ko'): Promise<ProfileSettings> {
  const response = await api.get<ProfileSettings>(`/profile`, { params: { locale } });
  return response.data;
}

export async function updateAdminProfile(locale: LocaleCode, payload: Partial<ProfileSettings>): Promise<ProfileSettings> {
  const response = await api.put<ProfileSettings>(`/admin/profile/${locale}`, payload);
  return response.data;
}

/**
 * 2. Portfolio API
 */
export async function getPortfolio(locale: LocaleCode = 'ko'): Promise<PortfolioResponse> {
  const response = await api.get<PortfolioResponse>(`/portfolio`, { params: { locale } });
  return response.data;
}

export async function createAdminPortfolioSection(payload: Partial<PortfolioSection>): Promise<PortfolioSection> {
  const response = await api.post<PortfolioSection>(`/admin/portfolio/sections`, payload);
  return response.data;
}

export async function updateAdminPortfolioSection(id: number, payload: Partial<PortfolioSection>): Promise<PortfolioSection> {
  const response = await api.put<PortfolioSection>(`/admin/portfolio/sections/${id}`, payload);
  return response.data;
}

export async function deleteAdminPortfolioSection(id: number): Promise<void> {
  await api.delete(`/admin/portfolio/sections/${id}`);
}

export async function reorderAdminPortfolioSections(sectionIds: number[]): Promise<void> {
  await api.put(`/admin/portfolio/sections/reorder`, { sectionIds });
}

/**
 * 3. Showcase API
 */
export async function getShowcaseList(params?: {
  category?: ShowcaseCategory;
  featured?: boolean;
  locale?: LocaleCode;
}): Promise<ShowcaseItem[]> {
  const response = await api.get<ShowcaseItem[]>(`/showcase`, { params });
  return response.data;
}

export async function getShowcaseDetail(slug: string): Promise<ShowcaseDetail> {
  const response = await api.get<ShowcaseDetail>(`/showcase/${slug}`);
  return response.data;
}

export async function createAdminShowcase(payload: Partial<ShowcaseItem>): Promise<ShowcaseItem> {
  const response = await api.post<ShowcaseItem>(`/admin/showcase`, payload);
  return response.data;
}

export async function updateAdminShowcase(id: number, payload: Partial<ShowcaseItem>): Promise<ShowcaseItem> {
  const response = await api.put<ShowcaseItem>(`/admin/showcase/${id}`, payload);
  return response.data;
}

export async function deleteAdminShowcase(id: number): Promise<void> {
  await api.delete(`/admin/showcase/${id}`);
}

export async function reorderAdminShowcase(showcaseIds: number[]): Promise<void> {
  await api.put(`/admin/showcase/reorder`, { showcaseIds });
}

/**
 * 4. SEO API
 */
export async function getSeoSettings(routeKey: string, locale: LocaleCode = 'ko'): Promise<SeoSettings> {
  const response = await api.get<SeoSettings>(`/seo`, { params: { routeKey, locale } });
  return response.data;
}

export async function updateAdminSeoSettings(routeKey: string, payload: Partial<SeoSettings>): Promise<SeoSettings> {
  const response = await api.put<SeoSettings>(`/admin/seo/${routeKey}`, payload);
  return response.data;
}
