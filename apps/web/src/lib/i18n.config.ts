import { getRequestConfig } from 'next-intl/server';

export const locales = ['de', 'en'] as const;
export const defaultLocale = 'de' as const;

export const localeLabels = {
  de: 'Deutsch',
  en: 'English',
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as typeof locales[number])) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
