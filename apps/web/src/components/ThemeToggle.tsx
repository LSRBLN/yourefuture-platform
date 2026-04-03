'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { applyTheme, getPreferredTheme, type Theme } from '@/lib/theme';

export function ThemeToggle() {
  const t = useTranslations();
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const preferred = getPreferredTheme();
    setTheme(preferred);
    applyTheme(preferred);
  }, []);

  const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
      aria-label={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
      title={theme === 'dark' ? t('theme.switchToLight') : t('theme.switchToDark')}
      className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-high)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--app-fg-variant)] transition-colors hover:bg-[var(--app-surface-highest)] hover:text-[var(--app-fg)]"
    >
      {theme === 'dark' ? t('theme.light') : t('theme.dark')}
    </button>
  );
}

