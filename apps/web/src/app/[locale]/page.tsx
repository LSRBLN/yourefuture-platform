'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold text-white">TrustShield</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/profile"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              {t('nav.profile')}
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              {t('home.title')}
            </h1>
            <p className="text-xl text-slate-300">
              {t('home.description')}
            </p>
            <div className="flex gap-4">
              <Link
                href="/osint"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                {t('home.cta')} →
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 border border-slate-600 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                {t('nav.login')}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-xl opacity-20"></div>
            <div className="relative bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur">
              <div className="space-y-4">
                <div className="h-3 bg-slate-700 rounded-full w-3/4"></div>
                <div className="h-3 bg-slate-700 rounded-full w-1/2"></div>
                <div className="h-12 bg-slate-700 rounded mt-6"></div>
                <div className="h-3 bg-slate-700 rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-800/50 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-4xl font-bold text-white mb-16 text-center">{t('home.features')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { emoji: '🔍', title: 'Multi-Source Search', desc: 'Search across 10+ OSINT sources in seconds' },
              { emoji: '⚠️', title: 'Breach Detection', desc: 'Detect compromised data in 500M+ records' },
              { emoji: '⚡', title: 'Fast Results', desc: 'Results in under 100ms with caching' },
              { emoji: '📊', title: 'Analytics', desc: 'Visualize patterns and relationships' },
              { emoji: '🔐', title: 'Privacy First', desc: 'Self-hosted, no data collection' },
              { emoji: '🏢', title: 'Enterprise Ready', desc: 'Batch operations and API access' },
            ].map((feature) => (
              <div key={feature.title} className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">{t('home.cta')}</h2>
        <p className="text-xl text-slate-300 mb-8">
          Get instant access to powerful OSINT tools.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            {t('auth.register')}
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-4 border border-slate-600 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
          >
            {t('auth.login')}
          </Link>
        </div>
      </section>
    </div>
  );
}
