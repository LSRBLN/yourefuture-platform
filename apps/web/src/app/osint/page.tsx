'use client';

import { Suspense } from 'react';
import { SyncfusionOSINTDashboard } from '@/components/osint/SyncfusionOSINTDashboard';

/**
 * OSINT Dashboard Page
 * 
 * Features:
 * - Real-time search results across multiple OSINT sources
 * - DataGrid with sorting, filtering, and export capabilities
 * - Real-time analytics and visualizations
 * - Breach detection and image indexing
 * - React Query data caching
 */

function DashboardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-gray-200 rounded"></div>
      <div className="h-96 bg-gray-200 rounded"></div>
    </div>
  );
}

export default function OSINTPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">OSINT Intelligence Dashboard</h1>
        <p className="text-gray-600">
          Search across multiple OSINT sources, detect breaches, and analyze findings
        </p>
      </div>

      {/* Dashboard Component */}
      <Suspense fallback={<DashboardSkeleton />}>
        <SyncfusionOSINTDashboard />
      </Suspense>

      {/* Footer Info */}
      <div className="border-t pt-6 text-sm text-gray-500">
        <p>
          💡 <strong>Tips:</strong> Use filters to narrow results • Export to Excel/PDF for reports • 
          Check Analytics tab for trend insights
        </p>
      </div>
    </div>
  );
}
