'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@trustshield/ui';

interface SupportRequestItem {
  id: string;
  requestType: 'support' | 'removal' | 'upload_review' | 'identity_review';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'triaged' | 'assigned' | 'in_progress' | 'waiting_user' | 'escalated' | 'resolved' | 'closed';
  message: string;
  preferredContact?: string;
  assignedTo?: string;
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

const priorityBadgeStyles: Record<string, string> = {
  urgent: 'bg-red-100 text-red-900',
  high: 'bg-orange-100 text-orange-900',
  medium: 'bg-yellow-100 text-yellow-900',
  low: 'bg-blue-100 text-blue-900',
};

const statusBadgeStyles: Record<string, string> = {
  open: 'bg-gray-100 text-gray-900',
  triaged: 'bg-blue-100 text-blue-900',
  assigned: 'bg-purple-100 text-purple-900',
  in_progress: 'bg-cyan-100 text-cyan-900',
  waiting_user: 'bg-yellow-100 text-yellow-900',
  escalated: 'bg-red-100 text-red-900',
  resolved: 'bg-green-100 text-green-900',
  closed: 'bg-gray-200 text-gray-900',
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_TRUSTSHIELD_API_URL ?? 'http://localhost:4000';
const apiAuthHeaders = {
  'x-trustshield-subject': 'ops-admin-web',
  'x-trustshield-role': 'admin',
} as const;

export default function SupportQueuePage() {
  const [requests, setRequests] = useState<SupportRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  useEffect(() => {
    loadSupportRequests();
  }, []);

  async function loadSupportRequests() {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/v1/support-requests`, {
        headers: apiAuthHeaders,
      });

      if (!response.ok) {
        throw new Error(`Failed to load support requests: ${response.statusText}`);
      }

      const data: SupportRequestItem[] = await response.json();
      setRequests(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function assignRequest(requestId: string, assignTo: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/support-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...apiAuthHeaders,
        },
        body: JSON.stringify({ assignedTo: assignTo }),
      });

      if (response.ok) {
        await loadSupportRequests();
      } else {
        setError('Failed to assign request');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  }

  async function updateStatus(requestId: string, newStatus: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/support-requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...apiAuthHeaders,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await loadSupportRequests();
      } else {
        setError('Failed to update status');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    }
  }

  const filteredRequests = requests.filter((req) => {
    if (filterStatus && req.status !== filterStatus) return false;
    if (filterPriority && req.priority !== filterPriority) return false;
    return true;
  });

  return (
    <main className="space-y-8 text-stone-900">
      <section className="space-y-6">
        <div className="space-y-2">
          <SectionLabel>Support Queue Management</SectionLabel>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl leading-tight text-stone-950">
            Manage Support Requests & Cases
          </h1>
        </div>

        <Card tone="elevated" className="space-y-6 bg-[linear-gradient(135deg,#094cb2_0%,#3366cc_100%)] text-white">
          <div className="space-y-4">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl text-white">Support Queue Overview</h2>
            <p className="text-white/84">View, filter, assign, and manage all support requests in one place.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white/15 p-4">
              <p className="text-white/72 text-sm">Total Requests</p>
              <p className="mt-2 text-3xl font-bold text-white">{requests.length}</p>
            </div>
            <div className="rounded-lg bg-white/15 p-4">
              <p className="text-white/72 text-sm">Open</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {requests.filter((r) => r.status === 'open' || r.status === 'triaged').length}
              </p>
            </div>
            <div className="rounded-lg bg-white/15 p-4">
              <p className="text-white/72 text-sm">In Progress</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {requests.filter((r) => r.status === 'in_progress').length}
              </p>
            </div>
            <div className="rounded-lg bg-white/15 p-4">
              <p className="text-white/72 text-sm">Urgent</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {requests.filter((r) => r.priority === 'urgent').length}
              </p>
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
          <Button variant="secondary" onClick={loadSupportRequests}>
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
              <option value="triaged">Triaged</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting_user">Waiting User</option>
              <option value="escalated">Escalated</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-600 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-stone-300 text-stone-900"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-600 mb-2">Search</label>
            <Input placeholder="Search by ID or message..." />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <Card tone="canvas" className="space-y-6">
          <div className="space-y-2">
            <SectionLabel>Support Requests</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'Request' : 'Requests'}
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
              <p className="text-stone-600">Loading support requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-stone-50 rounded-lg">
              <p className="text-stone-600">No support requests found</p>
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
                      Type
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Priority
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Status
                    </th>
                    <th className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      Assigned To
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
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-t border-stone-200 hover:bg-white/50">
                      <td className="px-4 py-3 text-sm text-stone-900 font-mono">{request.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-sm text-stone-900">{request.requestType}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${priorityBadgeStyles[request.priority]}`}>
                          {request.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeStyles[request.status]}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-900">{request.assignedTo || '-'}</td>
                      <td className="px-4 py-3 text-sm text-stone-900">{new Date(request.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm space-x-2">
                        {request.status === 'open' && (
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => updateStatus(request.id, 'triaged')}
                          >
                            Triage
                          </Button>
                        )}
                        {request.status === 'triaged' && (
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => assignRequest(request.id, 'Support Team')}
                          >
                            Assign
                          </Button>
                        )}
                        {request.status !== 'closed' && (
                          <Button
                            variant="secondary"
                            className="text-xs"
                            onClick={() => updateStatus(request.id, 'closed')}
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
