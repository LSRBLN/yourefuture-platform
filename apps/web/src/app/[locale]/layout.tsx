import { notFound } from 'next/navigation';
import { locales } from '@/lib/i18n.config';
import { AppShell } from '@/components/AppShell';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as never)) {
    notFound();
  }

  return (
    <AppShell locale={locale}>
      {children}
    </AppShell>
  );
}
