import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Noto_Serif, Public_Sans } from 'next/font/google';
import '@trustshield/ui/styles.css';
// Syncfusion Material Theme - Bootstrap 5 variant for modern look
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

// Initialize Syncfusion license at build time
if (typeof window === 'undefined') {
  initSyncfusionLicense();
}

export const metadata: Metadata = {
  title: 'TrustShield Web',
  description: 'TrustShield editorial public experience bootstrap',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${notoSerif.variable} ${publicSans.variable}`}>
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(9,76,178,0.08),_transparent_38%)]">
          <QueryProvider>
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
              <header className="bg-white/80 backdrop-blur-xl rounded-3xl px-6 py-5 text-stone-700">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-3xl space-y-2">
                    <p className="font-[family-name:var(--font-label)] text-xs uppercase tracking-[0.28em] text-stone-500">
                      TrustShield · Public Workspace
                    </p>
                    <h1 className="font-[family-name:var(--font-heading)] text-4xl leading-tight text-stone-950 sm:text-5xl">
                      Editorial guidance for evidence-led removal workflows.
                    </h1>
                  </div>
                  <p className="max-w-xl font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600 sm:text-base">
                    Calm surfaces, restrained primary emphasis and generous whitespace structure the public-facing shell.
                  </p>
                </div>
              </header>

              <main className="flex-1 py-8">
                <section className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
                  <div className="rounded-[2rem] bg-white px-6 py-8 sm:px-8 sm:py-10">{children}</div>
                  <aside className="space-y-4 rounded-[2rem] bg-stone-100 px-6 py-8 text-stone-700">
                    <div className="space-y-2">
                      <p className="font-[family-name:var(--font-label)] text-xs uppercase tracking-[0.24em] text-stone-500">
                        Surface hierarchy
                      </p>
                      <p className="font-[family-name:var(--font-body)] text-sm leading-6">
                        Tonal panels separate context, progress and trust cues without hard lines or visual noise.
                      </p>
                    </div>
                    <div className="rounded-[1.5rem] bg-stone-200/80 px-5 py-5">
                      <p className="font-[family-name:var(--font-label)] text-xs uppercase tracking-[0.24em] text-stone-500">
                        Primary restraint
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-700">
                        Reserve blue emphasis for focused links and the single primary action within each future screen.
                      </p>
                    </div>
                  </aside>
                </section>
              </main>
            </div>
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
