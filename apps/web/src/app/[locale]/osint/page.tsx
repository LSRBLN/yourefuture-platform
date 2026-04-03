'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
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
    <div className="flex flex-col h-full bg-[#0d0f14]">
      <div className="px-8 py-5 border-b border-[#1e2235] flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-white">{t('osint.dashboard')}</h1>
          <p className="text-[#8b90a0] text-xs mt-0.5">{t('nav.osint')}</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#161820] rounded-xl p-4">
            <p className="text-[#8b90a0] text-xs uppercase tracking-wider mb-2">{t('osint.searchTypes')}</p>
            <p className="text-[#c8cad4] text-sm font-medium">{t('osint.username')} · {t('osint.email')} · {t('osint.phone')} · {t('osint.domain')}</p>
          </div>
          <div className="bg-[#161820] rounded-xl p-4">
            <p className="text-[#8b90a0] text-xs uppercase tracking-wider mb-2">{t('osint.integratedSources')}</p>
            <p className="text-white text-2xl font-bold">10+</p>
            <p className="text-[#5a5f70] text-xs">OSINT Tools & Databases</p>
          </div>
          <div className="bg-[#161820] rounded-xl p-4">
            <p className="text-[#8b90a0] text-xs uppercase tracking-wider mb-2">{t('osint.responseTime')}</p>
            <p className="text-white text-2xl font-bold">&lt;100ms</p>
            <p className="text-[#5a5f70] text-xs">Average response time</p>
          </div>
        </div>

        <Suspense fallback={<DashboardSkeleton />}>
          <SyncfusionOSINTDashboard />
        </Suspense>

        <div className="mt-6 bg-[#161820] rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Tips</h3>
          <ul className="space-y-2 text-[#8b90a0] text-xs">
            <li><span className="text-[#c8cad4] font-semibold">Multi-Source:</span> Queries all 10+ sources simultaneously</li>
            <li><span className="text-[#c8cad4] font-semibold">Export:</span> Save results as Excel or PDF</li>
            <li><span className="text-[#c8cad4] font-semibold">Filtering:</span> Click column headers to sort and filter</li>
            <li><span className="text-[#c8cad4] font-semibold">Analytics:</span> Check the Analytics tab for trend analysis</li>
            <li><span className="text-[#c8cad4] font-semibold">Batch:</span> Upload multiple items for batch processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
