'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { SyncfusionOSINTDashboard } from '@/components/osint/SyncfusionOSINTDashboard';

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-slate-700 rounded"></div>
      <div className="h-96 bg-slate-700 rounded"></div>
    </div>
  );
}

export default function OSINTPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-xl">
              ←
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">OSINT Dashboard</h1>
              <p className="text-sm text-slate-400">Search & Intelligence Platform</p>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-2xl">
            ?️
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Search Types</p>
            <p className="text-white font-semibold mt-1">Username • Email • Phone • Domain • Image</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Integrated Sources</p>
            <p className="text-white font-semibold mt-1">10+ OSINT Tools & Databases</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            <p className="text-slate-400 text-sm">Response Time</p>
            <p className="text-white font-semibold mt-1">&lt; 100ms Average</p>
          </div>
        </div>

        {/* Dashboard Component */}
        <Suspense fallback={<DashboardSkeleton />}>
          <SyncfusionOSINTDashboard />
        </Suspense>

        {/* Tips Section */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">💡 Tips & Tricks</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>• <strong>Multi-Source:</strong> Search will query all 10+ sources simultaneously</li>
            <li>• <strong>Export:</strong> Use the export buttons to save results as Excel or PDF</li>
            <li>• <strong>Filtering:</strong> Click column headers to sort and filter results</li>
            <li>• <strong>Analytics:</strong> Check the Analytics tab for trend analysis and visualizations</li>
            <li>• <strong>Batch:</strong> Upload multiple items for batch processing</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
