import React, { createContext, useContext, useState, useEffect } from 'react';
import { i18nDict, type I18nKeys } from '../lib/i18n';
import type { LocaleCode } from '../types/profile';

interface LocaleContextProps {
  locale: LocaleCode;
  setLocale: (lang: LocaleCode) => void;
  t: (key: I18nKeys, variables?: Record<string, string>) => string;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

// 우선순위에 의거한 로케일 탐색 헬퍼 함수
const detectInitialLocale = (): LocaleCode => {
  // 1. URL Query parameter (?lang=en) 검사
  const params = new URLSearchParams(window.location.search);
  const queryLang = params.get('lang');
  if (queryLang === 'ko' || queryLang === 'en') {
    localStorage.setItem('locale', queryLang);
    return queryLang;
  }

  // 2. LocalStorage 기저장값 검사
  const saved = localStorage.getItem('locale');
  if (saved === 'ko' || saved === 'en') {
    return saved;
  }

  // 3. 브라우저 언어 환경(navigator.language) 조사
  const browserLang = navigator.language || (navigator as any).userLanguage || '';
  if (browserLang.toLowerCase().startsWith('en')) {
    return 'en';
  }

  // 4. Default 한국어 지정
  return 'ko';
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<LocaleCode>('ko');

  useEffect(() => {
    // 마운트 시 최초 우선순위 로케일 감지
    const initialLocale = detectInitialLocale();
    setLocaleState(initialLocale);
  }, []);

  const setLocale = (lang: LocaleCode) => {
    setLocaleState(lang);
    localStorage.setItem('locale', lang);

    // URL 쿼리에 'lang' 변수가 설정되어 있을 경우, 변경된 값과 싱크를 맞춤으로써 북마크 일관성을 확보해 줍니다.
    const url = new URL(window.location.href);
    if (url.searchParams.has('lang')) {
      url.searchParams.set('lang', lang);
      window.history.replaceState(null, '', url.toString());
    }
  };

  // 인자 맵 및 치환 번역 헬퍼 구현 t('key', { name: '...' })
  const t = (key: I18nKeys, variables?: Record<string, string>): string => {
    const dict = i18nDict[locale] || i18nDict.ko;
    let translation = dict[key] || i18nDict.ko[key] || (key as string);

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        translation = translation.replace(`{${k}}`, v);
      });
    }

    return translation;
  };

  return (
    <React.Fragment>
      <LocaleContext.Provider value={{ locale, setLocale, t }}>
        {children}
      </LocaleContext.Provider>
    </React.Fragment>
  );
};

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale hook must be used within a LocaleProvider');
  }
  return context;
}
export default useLocale;
