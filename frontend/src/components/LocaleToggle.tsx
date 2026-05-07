import { useLocale } from '../hooks/useLocale';
import { Globe } from 'lucide-react';

export default function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="relative inline-flex items-center gap-1.5 p-1 bg-surface-container/50 border border-outline-variant/20 rounded-full shadow-inner select-none font-body">
      <Globe className="w-3.5 h-3.5 text-on-surface-variant/70 ml-2" />
      
      <div className="relative flex items-center h-7 bg-surface-container/20 rounded-full p-0.5">
        {/* 슬라이딩 백그라운드 필 */}
        <div
          className={`absolute top-0.5 bottom-0.5 rounded-full bg-primary shadow-sm transition-all duration-300 ease-out ${
            locale === 'ko' ? 'left-0.5 w-[38px]' : 'left-[41px] w-[38px]'
          }`}
        />

        {/* 한국어 버튼 */}
        <button
          type="button"
          onClick={() => setLocale('ko')}
          className={`relative z-10 w-9 text-center text-[10px] font-black uppercase tracking-wider transition-colors duration-200 ${
            locale === 'ko' ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-label="한국어로 변경"
        >
          KO
        </button>

        {/* 영어 버튼 */}
        <button
          type="button"
          onClick={() => setLocale('en')}
          className={`relative z-10 w-9 text-center text-[10px] font-black uppercase tracking-wider transition-colors duration-200 ${
            locale === 'en' ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'
          }`}
          aria-label="Change to English"
        >
          EN
        </button>
      </div>
    </div>
  );
}
export { LocaleToggle };
