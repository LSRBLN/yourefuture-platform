import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, Noto_Serif, Public_Sans } from 'next/font/google';
import '@trustshield/ui/styles.css';

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

export const metadata: Metadata = {
  title: 'TrustShield Admin',
  description: 'TrustShield dense tonal admin experience bootstrap',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${notoSerif.variable} ${publicSans.variable}`}>
      <body className="min-h-screen bg-slate-950 font-sans text-slate-100 antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(9,76,178,0.18),_transparent_34%)]">
          <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 sm:px-6 lg:px-8">
            <header className="rounded-[2rem] bg-slate-900/85 px-6 py-5 backdrop-blur-xl">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] lg:items-end">
                <div className="space-y-2">
                  <p className="font-[family-name:var(--font-label)] text-xs uppercase tracking-[0.28em] text-slate-400">
                    TrustShield · Admin Console
                  </p>
                  <h1 className="font-[family-name:var(--font-heading)] text-3xl leading-tight text-white sm:text-4xl">
                    Dense operational shell for support, moderation and audit work.
                  </h1>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] bg-slate-800 px-4 py-4">
                    <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.24em] text-slate-400">
                      User shell
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">Calm and low-noise by default.</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-slate-700 px-4 py-4">
                    <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.24em] text-slate-300">
                      Admin shell
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white">Tighter spacing and stronger tonal density for rapid scanning.</p>
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 py-6">
              <section className="grid h-full gap-4 xl:grid-cols-[18rem_minmax(0,1fr)_20rem]">
                <aside className="rounded-[2rem] bg-slate-900 px-5 py-6 text-slate-300">
                  <p className="font-[family-name:var(--font-label)] text-xs uppercase tracking-[0.24em] text-slate-500">
                    Operational lanes
                  </p>
                  <div className="mt-4 space-y-3 text-sm leading-6">
                    <div className="rounded-[1.25rem] bg-slate-800 px-4 py-3">Queue triage</div>
                    <div className="rounded-[1.25rem] bg-slate-800 px-4 py-3">Removal oversight</div>
                    <div className="rounded-[1.25rem] bg-slate-800 px-4 py-3">Audit continuity</div>
                  </div>
                </aside>
                <div className="rounded-[2rem] bg-slate-900/90 px-6 py-6">{children}</div>
                <aside className="rounded-[2rem] bg-slate-800 px-5 py-6 text-slate-200">
                  <p className="font-[family-name:var(--font-label)] text-xs uppercase tracking-[0.24em] text-slate-400">
                    Signal stack
                  </p>
                  <div className="mt-4 space-y-3 text-sm leading-6">
                    <div className="rounded-[1.25rem] bg-slate-700 px-4 py-3">Alert volume and SLA snapshots</div>
                    <div className="rounded-[1.25rem] bg-slate-700 px-4 py-3">Moderator notes and escalation context</div>
                  </div>
                </aside>
              </section>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
