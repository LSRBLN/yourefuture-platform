'use client';
// Dark-theme compact language switcher

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
    <div className="flex gap-0.5 p-0.5 bg-[#1c1f29] rounded-lg">
      {['de', 'en'].map((l) => (
        <button
          key={l}
          onClick={() => handleLanguageChange(l)}
          className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
            locale === l
              ? 'bg-[#242836] text-white'
              : 'text-[#5a5f70] hover:text-[#8b90a0]'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
