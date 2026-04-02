'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@trustshield/ui';

interface RemovalCase {
  id: string;
  platform: string;
  targetUrl: string;
  caseType: 'privacy_removal' | 'non_consensual_intimate' | 'impersonation' | 'defamation' | 'copyright' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'preparing' | 'submitted' | 'under_review' | 'followup_required' | 'escalated' | 'removed' | 'partially_removed' | 'rejected' | 'closed';
  summary: string;
  createdAt: string;
  updatedAt: string;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
      {children}
    </p>
  );
}

const severityBadgeStyles: Record<string, string> = {
  critical: 'bg-red-100 text-red-900',
  high: 'bg-orange-100 text-orange-900',
  medium: 'bg-yellow-100 text-yellow-900',
  low: 'bg-blue-100 text-blue-900',
};

const statusBadgeStyles: Record<string, string> = {
  open: 'bg-gray-100 text-gray-900',
  preparing: 'bg-blue-100 text-blue-900',
  submitted: 'bg-purple-100 text-purple-900',
  under_review: 'bg-cyan-100 text-cyan-900',
  followup_required: 'bg-yellow-100 text-yellow-900',
  escalated: 'bg-red-100 text-red-900',
  removed: 'bg-green-100 text-green-900',
  partially_removed: 'bg-lime-100 text-lime-900',
  rejected: 'bg-red-200 text-red-900',
  closed: 'bg-gray-200 text-gray-900',
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_TRUSTSHIELD_API_URL ?? 'http://localhost:4000';
const apiAuthHeaders = {
  'x-trustshield-subject': 'ops-admin-web',
  'x-trustshield-role': 'admin',
} as const;

export default function RemovalCenterPage() {
  const [cases, setCases] = useState<RemovalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');

  useEffect(() => {
    loadRemovalCases();
  }, []);

  async function loadRemovalCases() {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/v1/removal-cases`, {
        headers: apiAuthHeaders,
      });

      if (!response.ok) {
        throw new Error(`Failed to load removal cases: ${response.statusText}`);
      }

      const data: RemovalCase[] = await response.json();
      setCases(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setCases([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateCaseStatus(caseId: string, newStatus: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/removal-cases/${caseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...apiAuthHeaders,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await loadRemovalCases();
      } else {
        setError('Failed to update case status');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  }

  const filteredCases = cases.filter((c) => {
    if (filterStatus && c.status !== filterStatus) return false;
    if (filterSeverity && c.severity !== filterSeverity) return false;
    return true;
  });

  const statusCounts = {
    open: cases.filter((c) => c.status === 'open').length,
    submitted: cases.filter((c) => c.status === 'submitted').length,
    removed: cases.filter((c) => c.status === 'removed' || c.status === 'partially_removed').length,
    critical: cases.filter((c) => c.severity === 'critical').length,
  };

  return (
    <main className="space-y-8 text-stone-900">
      <section className="space-y-6">
        <div className="space-y-2">
          <SectionLabel>Removal Center</SectionLabel>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl leading-tight text-stone-950">
            Manage Content Removal Cases
          </h1>
        </div>

        <Card tone="elevated" className="space-y-6 bg-[linear-gradient(135deg,#a0362f_0%,#c85144_100%)] text-white">
          <div className="space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl text-white">Removal Cases Overview</h2>
            <p className="text-white/84">Track and manage content removal requests across all platforms.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white/15 p-4">
              <p className="text-white/72 text-sm">Total Cases</p>
              <p className="mt-2 text-3xl font-bold text-white">{cases.length}</p>
            </div>
            <div className="rounded-lg bg-white/15 p-4">
              <p className="text-white/72 text-sm">Open/Preparing</p>
              <p className="mt-2 text-3xl font-bold text-white">{statusCounts.open}</p>
            </div>
            <div className="rounded-lg bg-white/15 p-4">
              <p className="text-white/72 text-sm">Submitted</p>
              <p className="mt-2 text-3xl font-bold text-white">{statusCounts.submitted}</p>
            </div>
            <div className="rounded-lg bg-white/15 p-4">
              <p className="text-white/72 text-sm">Removed</p>
              <p className="mt-2 text-3xl font-bold text-white">{statusCounts.removed}</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <SectionLabel>Filters</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              Filter & Search
            </h2>
          </div>
          <Button variant="secondary" onClick={loadRemovalCases}>
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-stone-600 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-stone-300 text-stone-900"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="preparing">Preparing</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="followup_required">Follow-up Required</option>
              <option value="escalated">Escalated</option>
              <option value="removed">Removed</option>
              <option value="partially_removed">Partially Removed</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-600 mb-2">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-stone-300 text-stone-900"
            >
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-600 mb-2">Search</label>
            <Input placeholder="Search by ID, platform or URL..." />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <Card tone="canvas" className="space-y-6">
          <div className="space-y-2">
            <SectionLabel>Removal Cases</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              {filteredCases.length} {filteredCases.length === 1 ? 'Case' : 'Cases'}
            </h2>
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-4 text-red-900">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-stone-600">Loading removal cases...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-lg">
              <p className="text-stone-600">No removal cases found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[1.75rem] bg-[#f8f5ef] p-2">
              <table className="min-w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="text-stone-500">
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      ID
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Platform
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Type
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Severity
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Status
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      URL
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Created
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCases.map((c) => (
                    <tr key={c.id} className="border-t border-stone-200 hover:bg-white/50">
                      <td className="px-4 py-3 text-sm text-stone-900 font-mono">{c.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-sm text-stone-900">{c.platform}</td>
                      <td className="px-4 py-3 text-sm text-stone-900">{c.caseType}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${severityBadgeStyles[c.severity]}`}>
                          {c.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeStyles[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600 truncate max-w-xs">
                        <a href={c.targetUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {new URL(c.targetUrl).hostname}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-900">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        {c.status === 'open' && (
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => updateCaseStatus(c.id, 'preparing')}
                          >
                            Prepare
                          </Button>
                        )}
                        {c.status === 'preparing' && (
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => updateCaseStatus(c.id, 'submitted')}
                          >
                            Submit
                          </Button>
                        )}
                        {c.status !== 'removed' && c.status !== 'closed' && (
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => updateCaseStatus(c.id, 'closed')}
                          >
                            Close
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}
