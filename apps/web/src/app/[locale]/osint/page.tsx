'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { SyncfusionOSINTDashboard } from '@/components/osint/SyncfusionOSINTDashboard';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-12 bg-surface-container-high rounded-md"></div>
      <div className="h-96 bg-surface-container-high rounded-md"></div>
    </div>
  );
}

export default function OSINTPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-surface/95 backdrop-blur-lg border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-2 hover:bg-surface-container rounded-md transition-colors text-xl text-on-surface">
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-on-surface">{t('osint.dashboard')}</h1>
              <p className="text-sm text-on-surface-variant">{t('nav.osint')}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-surface-container rounded-md transition-colors text-2xl">
            ?️
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-surface-container-high/60 rounded-lg p-6 backdrop-blur-md shadow-elevation-1">
            <p className="text-on-surface-variant text-sm font-medium">{t('osint.searchTypes')}</p>
            <p className="text-on-surface font-semibold mt-3">{t('osint.username')} • {t('osint.email')} • {t('osint.phone')} • {t('osint.domain')} • {t('osint.image')}</p>
          </div>
          <div className="bg-surface-container-high/60 rounded-lg p-6 backdrop-blur-md shadow-elevation-1">
            <p className="text-on-surface-variant text-sm font-medium">{t('osint.integratedSources')}</p>
            <p className="text-on-surface font-semibold mt-3">10+ OSINT Tools & Databases</p>
          </div>
          <div className="bg-surface-container-high/60 rounded-lg p-6 backdrop-blur-md shadow-elevation-1">
            <p className="text-on-surface-variant text-sm font-medium">{t('osint.responseTime')}</p>
            <p className="text-on-surface font-semibold mt-3">&lt; 100ms Average</p>
          </div>
        </div>

        {/* Dashboard Component */}
        <Suspense fallback={<DashboardSkeleton />}>
          <SyncfusionOSINTDashboard />
        </Suspense>

        {/* Tips Section */}
        <div className="mt-12 bg-surface-container-high/60 rounded-lg p-8 backdrop-blur-md shadow-elevation-1">
          <h3 className="text-on-surface font-serif font-bold text-lg mb-6">💡 {t('osint.tips')}</h3>
          <ul className="space-y-3 text-on-surface-variant text-sm">
            <li>• <strong className="text-on-surface">Multi-Source:</strong> {t('osint.search')} will query all 10+ sources simultaneously</li>
            <li>• <strong className="text-on-surface">Export:</strong> Use the export buttons to save results as Excel or PDF</li>
            <li>• <strong className="text-on-surface">Filtering:</strong> Click column headers to sort and filter results</li>
            <li>• <strong className="text-on-surface">Analytics:</strong> Check the Analytics tab for trend analysis and visualizations</li>
            <li>• <strong className="text-on-surface">Batch:</strong> Upload multiple items for batch processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
