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
    <div className="flex gap-1 p-1 bg-surface-container-high/40 rounded-md shadow-elevation-1">
      <button
        onClick={() => handleLanguageChange('de')}
        className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
          locale === 'de'
            ? 'bg-primary text-white shadow-elevation-1'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        DE
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${
          locale === 'en'
            ? 'bg-primary text-white shadow-elevation-1'
            : 'text-on-surface-variant hover:text-on-surface'
        }`}
      >
        EN
      </button>
    </div>
  );
}
