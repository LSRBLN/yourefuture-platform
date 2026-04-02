'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur-lg border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <span className="text-2xl font-serif font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              TrustShield
            </span>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
            <Link
              href="/profile"
              className="text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium"
            >
              {t('nav.profile')}
            </Link>
            <Link
              href="/auth/login"
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors shadow-elevation-1"
            >
              {t('nav.login')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight text-on-surface">
              {t('home.title')}
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed max-w-md">
              {t('home.description')}
            </p>
            <div className="flex gap-4 pt-4">
              <Link
                href="/osint"
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors shadow-elevation-2"
              >
                {t('home.cta')} →
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-3 bg-surface-container-high text-primary rounded-md font-medium hover:bg-surface-container-highest transition-colors shadow-elevation-1"
              >
                {t('nav.login')}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur-3xl opacity-60"></div>
            <div className="relative bg-surface-container-high/60 backdrop-blur-md rounded-lg p-12 shadow-elevation-3">
              <div className="space-y-4">
                <div className="h-3 bg-surface-container-highest rounded-full w-3/4"></div>
                <div className="h-3 bg-surface-container-highest rounded-full w-1/2"></div>
                <div className="h-12 bg-primary/20 rounded-md mt-8"></div>
                <div className="h-3 bg-surface-container-highest rounded-full w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-surface-container border-t border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-32">
          <h2 className="text-5xl font-serif font-bold text-on-surface mb-20 text-center">
            {t('home.features')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { emoji: '🔍', title: 'Multi-Source Search', desc: 'Search across 10+ OSINT sources in seconds' },
              { emoji: '⚠️', title: 'Breach Detection', desc: 'Detect compromised data in 500M+ records' },
              { emoji: '⚡', title: 'Fast Results', desc: 'Results in under 100ms with caching' },
              { emoji: '📊', title: 'Analytics', desc: 'Visualize patterns and relationships' },
              { emoji: '🔐', title: 'Privacy First', desc: 'Self-hosted, no data collection' },
              { emoji: '🏢', title: 'Enterprise Ready', desc: 'Batch operations and API access' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-surface-container-high/60 rounded-lg p-8 hover:bg-surface-container-highest/80 transition-colors shadow-elevation-1 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{feature.emoji}</div>
                <h3 className="text-lg font-serif font-semibold text-on-surface mb-3">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center">
        <h2 className="text-5xl font-serif font-bold text-on-surface mb-8">{t('home.cta')}</h2>
        <p className="text-lg text-on-surface-variant mb-12 leading-relaxed">
          Get instant access to powerful OSINT tools.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors shadow-elevation-2"
          >
            {t('auth.register')}
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-surface-container-high text-primary rounded-md font-medium hover:bg-surface-container-highest transition-colors shadow-elevation-1"
          >
            {t('auth.login')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container border-t border-outline-variant/20 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-on-surface-variant text-sm">
          <p>© 2026 TrustShield. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
