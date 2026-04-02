import type { Metadata } from 'next';
import { Inter, Noto_Serif, Public_Sans } from 'next/font/google';
import '@trustshield/ui/styles.css';
import '@syncfusion/ej2-base/styles/bootstrap5.css';
import { QueryProvider } from '@/providers/QueryProvider';
import { initSyncfusionLicense } from '@/lib/syncfusion-license';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${inter.variable} ${notoSerif.variable} ${publicSans.variable}`}>
      <body className="min-h-screen bg-slate-900 font-sans text-slate-900 antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
