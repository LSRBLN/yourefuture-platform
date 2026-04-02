'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    if (locale === newLocale) return;

    // Remove current locale from path and add new one
    const pathWithoutLocale = pathname.replace(`/${locale}`, '');
    const newPathname = `/${newLocale}${pathWithoutLocale || ''}`;
    router.push(newPathname);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleLanguageChange('de')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          locale === 'de'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        DE
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        EN
      </button>
    </div>
  );
}
