import { useState, useEffect, useCallback } from 'react';
import { getProfile } from '../lib/profileApi';
import type { LocaleCode, ProfileSettings } from '../types/profile';

export function useProfile(initialLocale: LocaleCode = 'ko') {
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [locale, setLocale] = useState<LocaleCode>(initialLocale);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (targetLocale: LocaleCode) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile(targetLocale);
      setProfile(data);
    } catch (err: any) {
      console.error('Failed to fetch profile', err);
      setError(err?.message || '프로필 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile(locale);
  }, [locale, fetchProfile]);

  const changeLocale = useCallback((newLocale: LocaleCode) => {
    setLocale(newLocale);
  }, []);

  const refreshProfile = useCallback(() => {
    fetchProfile(locale);
  }, [locale, fetchProfile]);

  return {
    profile,
    locale,
    loading,
    error,
    changeLocale,
    refreshProfile,
  };
}
export default useProfile;
