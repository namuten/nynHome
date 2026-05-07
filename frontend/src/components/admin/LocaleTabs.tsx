import { Globe } from 'lucide-react';
import type { LocaleCode } from '../../types/profile';

interface LocaleTabsProps {
  activeLocale: LocaleCode;
  onChange: (locale: LocaleCode) => void;
}

export default function LocaleTabs({ activeLocale, onChange }: LocaleTabsProps) {
  return (
    <div className="flex border-b border-outline-variant/50 gap-1 mb-6">
      <button
        type="button"
        onClick={() => onChange('ko')}
        className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all relative ${
          activeLocale === 'ko'
            ? 'text-primary'
            : 'text-on-surface-variant/70 hover:text-on-surface'
        }`}
      >
        <Globe className="w-4 h-4 text-primary" />
        <span>한국어 (KO)</span>
        {activeLocale === 'ko' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-primary rounded-full animate-fade-in" />
        )}
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition-all relative ${
          activeLocale === 'en'
            ? 'text-primary'
            : 'text-on-surface-variant/70 hover:text-on-surface'
        }`}
      >
        <Globe className="w-4 h-4 text-accent" />
        <span>영어 (EN)</span>
        {activeLocale === 'en' && (
          <div className="absolute bottom-0 left-0 right-0 h-0.75 bg-primary rounded-full animate-fade-in" />
        )}
      </button>
    </div>
  );
}
export { LocaleTabs };
