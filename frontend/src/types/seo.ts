import type { LocaleCode } from './profile';

export interface SeoSettings {
  id?: number;
  routeKey: string;
  locale: LocaleCode;
  title: string;
  description: string | null;
  ogImageUrl: string | null;
  keywords: string[];
  createdAt?: string;
  updatedAt?: string;
}
