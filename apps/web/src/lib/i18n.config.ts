import { getRequestConfig } from 'next-intl/server';

export const locales = ['de', 'en'] as const;
export const defaultLocale = 'de' as const;

export const localeLabels = {
  de: 'Deutsch',
  en: 'English',
} as const;

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../../messages/${locale}.json`)).default,
}));
