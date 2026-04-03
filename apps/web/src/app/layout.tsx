import type { Metadata } from 'next';
import { Inter, Noto_Serif, Public_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import '@trustshield/ui/styles.css';
import '@syncfusion/ej2-base/styles/bootstrap5.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { initSyncfusionLicense } from '@/lib/syncfusion-license';
import { defaultLocale } from '@/lib/i18n.config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const notoSerif = Noto_Serif({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-label',
  display: 'swap',
});

if (typeof window === 'undefined') {
  initSyncfusionLicense();
}

export const metadata: Metadata = {
  title: 'TrustShield',
  description: 'Professional OSINT Intelligence Platform',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale().catch(() => defaultLocale);
  const messages = await getMessages({ locale }).catch(async () => {
    return (await import(`../../messages/${defaultLocale}.json`)).default;
  });

  return (
    <html className={`${inter.variable} ${notoSerif.variable} ${publicSans.variable} h-full`}>
      <body className="h-full overflow-hidden bg-[var(--app-bg)] font-sans text-[var(--app-fg)] antialiased transition-colors">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  const STORAGE_KEY = 'trustshield-theme';
  const root = document.documentElement;
  const stored = localStorage.getItem(STORAGE_KEY);
  const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = stored === 'dark' || stored === 'light' ? stored : preferred;
  root.dataset.theme = theme;
  root.classList.toggle('dark', theme === 'dark');
})();`,
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
