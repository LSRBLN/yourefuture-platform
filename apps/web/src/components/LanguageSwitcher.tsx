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
    <div className="flex gap-0.5 rounded-lg bg-[var(--app-surface-high)] p-0.5">
      {['de', 'en'].map((l) => (
        <button
          type="button"
          key={l}
          onClick={() => handleLanguageChange(l)}
          aria-pressed={locale === l}
          className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
            locale === l
              ? 'bg-[var(--app-surface-highest)] text-[var(--app-fg)]'
              : 'text-[var(--app-fg-muted)] hover:text-[var(--app-fg-variant)]'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
