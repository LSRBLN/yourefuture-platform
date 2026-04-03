"use client";

import { useEffect, useState } from 'react';

import {
  defaultReviewQueueFilterState,
  defaultSupportQueueFilterState,
  selectOutcomeActionStates,
  selectReviewQueueItems,
  selectSupportQueueItems,
} from '@trustshield/core';
import type { EvidenceCoverage, ReviewDecisionOutcome, ReviewQueueItem, SlaRisk, SupportQueueItem, SupportRequestRecord } from '@trustshield/core';
import { AuditRetentionPanel, Badge, Button, Card, Input, RbacAuditHintCard, ReviewDecisionCard, ReviewOutcomeActionPanel, ReviewOutcomeGuidanceCard, SupportQueueRow } from '@trustshield/ui';
import { parseReviewQueueItems, parseSupportQueueItems } from '@trustshield/validation';

type ActivityItem = {
  title: string;
  detail: string;
  meta: string;
  tone: 'info' | 'warning' | 'critical';
};

type RoleCapability = {
  role: 'Support' | 'Analyst' | 'Admin';
  scope: string;
  audit: string;
};

type AuditLaneItem = {
  event: string;
  reason: string;
  retention: string;
};

type ReviewOutcomeAction = {
  outcome: ReviewDecisionOutcome;
  actionLabel: string;
  rbacScope: string;
  auditEvent: string;
  retention: string;
  emphasis?: 'default' | 'warning' | 'critical';
};

const toneDotClassNames: Record<ActivityItem['tone'], string> = {
  info: 'bg-[#094cb2]',
  warning: 'bg-[#6d5e00]',
  critical: 'bg-[#a0362f]',
};

const roleCapabilities: RoleCapability[] = [
  {
    role: 'Support',
    scope: 'Zugewiesene oder queue-freigegebene Support- und Removal-Fälle mit minimalem Datenumfang.',
    audit: 'Zuweisungen, Statuswechsel und Rückfragen werden nachvollziehbar protokolliert.',
  },
  {
    role: 'Analyst',
    scope: 'Analysefreigegebene Review-Objekte und sensible Evidenz nur bei Need-to-know.',
    audit: 'Medienansichten und Reviewer-Entscheidungen werden mit Grund und Zeitstempel erfasst.',
  },
  {
    role: 'Admin',
    scope: 'Globale Queue-, Audit- und Betriebsübersicht ohne vorausgesetzten Vollzugriff auf jede Falldetailtiefe.',
    audit: 'Audit-Log-Leserechte bleiben explizit und zweckgebunden.',
  },
];

const auditLane: AuditLaneItem[] = [
  {
    event: 'Review-Entscheidung · action_recommended',
    reason: 'Reviewer-Outcome mit Evidenzsnapshot und Eskalationspfad speichern.',
    retention: 'Audit-Log gemäß Backoffice-Zweckbindung aufbewahren.',
  },
  {
    event: 'Sicht auf sensibles Asset',
    reason: 'Need-to-know-Zugriff muss für Analyst/Admin nachvollziehbar bleiben.',
    retention: 'Sicherheitsrelevante Zugriffe separat protokollieren.',
  },
  {
    event: 'Queue-Zuweisung geändert',
    reason: 'RBAC-konformer Besitzwechsel in Support- oder Review-Lane dokumentieren.',
    retention: 'Für SLA- und Incident-Review auswertbar halten.',
  },
];

const reviewOutcomeActions: ReviewOutcomeAction[] = [
  {
    outcome: 'action_recommended',
    actionLabel: 'Support-Handover vorbereiten',
    rbacScope: 'Analyst erstellt Outcome, Support/Admin übernehmen den nächsten operativen Schritt.',
    auditEvent: 'review.outcome.action_recommended',
    retention: 'Outcome, Rationale und Handover-Ziel mit Zeitstempel vorhalten.',
    emphasis: 'default',
  },
  {
    outcome: 'removal_recommended',
    actionLabel: 'Removal Case vorkonfigurieren',
    rbacScope: 'Nur Rollen mit Removal-Berechtigung dürfen daraus einen Fall erzeugen oder eskalieren.',
    auditEvent: 'review.outcome.removal_recommended',
    retention: 'Verknüpfung zu Evidenzsnapshot und Zielplattform revisionsfähig halten.',
    emphasis: 'critical',
  },
  {
    outcome: 'insufficient_evidence',
    actionLabel: 'Nachforderung mit Guidance erzeugen',
    rbacScope: 'Support fordert Kontext nach; Analyst sieht nur begründete Evidence-Lücken.',
    auditEvent: 'review.outcome.insufficient_evidence',
    retention: 'Nachforderung, Begründung und Response-Fenster auditierbar speichern.',
    emphasis: 'warning',
  },
];

const outcomeActionBadgeClassNames = [
  'bg-[#eef3fb] text-[#094cb2]',
  'bg-[#f6ede9] text-[#8a4b22]',
  'bg-[#f1ece2] text-stone-700',
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">{children}</p>;
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_TRUSTSHIELD_API_URL ?? 'http://localhost:4000';
const apiAuthHeaders = {
  'x-trustshield-subject': 'ops-admin-web',
  'x-trustshield-role': 'admin',
} as const;

function deriveSlaRisk(priority: SupportRequestRecord['priority'], status: SupportRequestRecord['status']): SlaRisk {
  if (status === 'escalated') {
    return 'breach';
  }

  if (priority === 'urgent') {
    return 'breach';
  }

  if (priority === 'high' || status === 'in_progress') {
    return 'risk';
  }

  return 'healthy';
}

function deriveEvidenceCoverage(record: SupportRequestRecord): EvidenceCoverage {
  const linkedReferences = [record.checkId, record.assetId, record.removalCaseId].filter(Boolean).length;

  if (linkedReferences >= 2) {
    return 'complete';
  }

  if (linkedReferences === 1) {
    return 'partial';
  }

  return 'missing';
}

function mapSupportRequestToQueueItem(record: SupportRequestRecord): SupportQueueItem {
  return {
    id: record.id,
    requesterLabel: record.preferredContact ? `${record.requestType} · ${record.preferredContact}` : record.requestType,
    priority: record.priority,
    requestType: record.requestType,
    status: record.status,
    assignedTo: record.assignedTo,
    slaRisk: deriveSlaRisk(record.priority, record.status),
    slaDueAt: record.retention?.lastReviewedAt ?? record.updatedAt,
    updatedAt: record.updatedAt,
    note: record.message,
    linkedRemovalCaseId: record.removalCaseId,
    evidenceCoverage: deriveEvidenceCoverage(record),
  };
}

function buildSupportMetrics(supportQueue: SupportQueueItem[], reviewQueue: ReviewQueueItem[]) {
  const slaRiskCount = supportQueue.filter((item) => item.slaRisk === 'risk' || item.slaRisk === 'breach').length;
  const escalatedReviews = reviewQueue.filter((item) => item.linkedRemovalCaseId || item.status === 'escalated').length;
  const assignedSupportItems = supportQueue.filter((item) => item.assignedTo).length;
  const coverageRate = supportQueue.length === 0 ? 100 : Math.round((assignedSupportItems / supportQueue.length) * 1000) / 10;

  return [
    {
      label: 'Aktive Queue',
      value: String(supportQueue.length),
      detail: `${reviewQueue.length} Review-Objekte speisen denselben operativen Kontext.`,
      toneClassName: 'bg-[#eef3fb] text-[#094cb2]',
    },
    {
      label: 'Plattformzustand',
      value: slaRiskCount === 0 ? 'Stabil' : 'Beobachten',
      detail: slaRiskCount === 0 ? 'Keine akuten SLA-Risiken im aktuellen Queue-Snapshot.' : `${slaRiskCount} Fälle mit erhöhtem SLA-Risiko oder Eskalationsnähe.`,
      toneClassName: 'bg-[#f3efe7] text-[#6d5e00]',
    },
    {
      label: 'Review Handover',
      value: String(escalatedReviews),
      detail: 'Review-Items mit Removal- oder Eskalationsbezug.',
      toneClassName: 'bg-[#e9f3ec] text-[#1f6b45]',
    },
    {
      label: 'Assignment Coverage',
      value: `${coverageRate.toFixed(1).replace('.', ',')}%`,
      detail: 'Anteil bereits zugewiesener Support-Fälle im aktuellen Snapshot.',
      toneClassName: 'bg-[#f6ede9] text-[#8a4b22]',
    },
  ] as const;
}

function buildActivityFeed(supportQueue: SupportQueueItem[], reviewQueue: ReviewQueueItem[]): ActivityItem[] {
  const supportItems = supportQueue.slice(0, 2).map<ActivityItem>((item) => ({
    title: `Support-Fall ${item.id}`,
    detail: item.note,
    meta: `${item.updatedAt} · ${item.status}`,
    tone: item.slaRisk === 'breach' ? 'critical' : item.slaRisk === 'risk' ? 'warning' : 'info',
  }));

  const reviewItems = reviewQueue.slice(0, 2).map<ActivityItem>((item) => ({
    title: `Review ${item.id}`,
    detail: item.recommendedAction,
    meta: `${item.updatedAt} · ${item.status}`,
    tone: item.linkedRemovalCaseId ? 'critical' : item.status === 'escalated' ? 'warning' : 'info',
  }));

  return [...supportItems, ...reviewItems].slice(0, 4);
}

export default function AdminHomePage() {
  const [actionStatus, setActionStatus] = useState<string>('Queue-Aktionen noch nicht ausgelöst.');
  const [queueState, setQueueState] = useState<SupportQueueItem[]>([]);
  const [reviewState, setReviewState] = useState<ReviewQueueItem[]>([]);
  const filterState = defaultSupportQueueFilterState;
  const supportQueue = parseSupportQueueItems(selectSupportQueueItems(queueState, filterState));
  const reviewFilterState = {
    ...defaultReviewQueueFilterState,
    onlyEscalated: true,
  };
  const reviewQueue = parseReviewQueueItems(selectReviewQueueItems(reviewState, reviewFilterState));
  const activeReviewCount = reviewQueue.filter((item) => item.status !== 'closed').length;
  const supportMetrics = buildSupportMetrics(supportQueue, reviewQueue);
  const activityFeed = buildActivityFeed(supportQueue, reviewQueue);
  const outcomeActionStates = selectOutcomeActionStates(
    reviewQueue,
    reviewOutcomeActions.map((action) => action.outcome),
  );

  useEffect(() => {
    void Promise.all([refreshSupportQueue(), refreshReviewQueue()]);
  }, []);

  async function refreshReviewQueue() {
    const response = await fetch(`${apiBaseUrl}/api/v1/reviews`, {
      headers: apiAuthHeaders,
    });
    const payload = (await response.json()) as { data?: ReviewQueueItem[]; error?: { message?: string } };

    if (!response.ok || !payload.data) {
      setActionStatus(payload.error?.message ?? 'Review-Queue konnte nicht geladen werden.');
      return;
    }

    setReviewState(payload.data);
  }

  async function handlePrioritize() {
    const selectedReview = reviewQueue[0];
    if (!selectedReview?.linkedRemovalCaseId) {
      setActionStatus('Kein Removal Case für Priorisierung verfügbar.');
      return;
    }

    const response = await fetch(`${apiBaseUrl}/api/v1/removal-cases/${selectedReview.linkedRemovalCaseId}/actions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...apiAuthHeaders },
      body: JSON.stringify({
        actionType: 'internal_note',
        payloadSummary: 'Priorität aus Admin-Queue bestätigt',
        resultStatus: 'submitted',
      }),
    });
    const payload = (await response.json()) as { data?: { id: string; status: string } };
    setActionStatus(payload.data ? `Removal Case ${payload.data.id} aktualisiert: ${payload.data.status}` : 'API-Antwort ohne aktualisierte Daten.');
  }

  async function refreshSupportQueue() {
    const response = await fetch(`${apiBaseUrl}/api/v1/support-requests`, {
      headers: apiAuthHeaders,
    });
    const payload = (await response.json()) as { data?: SupportRequestRecord[]; error?: { message?: string } };

    if (!response.ok || !payload.data) {
      setActionStatus(payload.error?.message ?? 'Support-Queue konnte nicht geladen werden.');
      return;
    }

    setQueueState(payload.data.map(mapSupportRequestToQueueItem));
    setActionStatus(`Support-Queue aktualisiert: ${payload.data.length} Datensätze geladen.`);
  }

  async function assignTopSupportRequest() {
    const topItem = supportQueue[0];
    if (!topItem) {
      setActionStatus('Keine Support-Anfrage für Zuweisung verfügbar.');
      return;
    }

    const response = await fetch(`${apiBaseUrl}/api/v1/support-requests/${topItem.id}/assign`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...apiAuthHeaders },
      body: JSON.stringify({ assignedTo: 'Murat S.', assignedBy: 'admin-console', reason: 'Backoffice-Priorisierung' }),
    });
    const payload = (await response.json()) as { data?: { id: string; assignedTo?: string }; error?: { message?: string } };

    if (!response.ok || !payload.data) {
      setActionStatus(payload.error?.message ?? 'Zuweisung fehlgeschlagen.');
      return;
    }

    setActionStatus(`Support-Anfrage ${payload.data.id} wurde ${payload.data.assignedTo ?? 'niemandem'} zugewiesen.`);
    await refreshSupportQueue();
  }

  async function progressTopSupportRequest() {
    const topItem = supportQueue[0];
    if (!topItem) {
      setActionStatus('Keine Support-Anfrage für Statuswechsel verfügbar.');
      return;
    }

    const response = await fetch(`${apiBaseUrl}/api/v1/support-requests/${topItem.id}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...apiAuthHeaders },
      body: JSON.stringify({ status: 'in_progress', changedBy: 'admin-console', reason: 'Aktive Bearbeitung gestartet' }),
    });
    const payload = (await response.json()) as { data?: { id: string; status: string }; error?: { message?: string } };

    if (!response.ok || !payload.data) {
      setActionStatus(payload.error?.message ?? 'Statuswechsel fehlgeschlagen.');
      return;
    }

    setActionStatus(`Support-Anfrage ${payload.data.id} steht jetzt auf ${payload.data.status}.`);
    await refreshSupportQueue();
  }

  return (
    <main className="space-y-8 text-stone-900">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.75fr)]">
        <Card tone="elevated" className="relative overflow-hidden space-y-6 bg-[linear-gradient(135deg,#094cb2_0%,#3366cc_100%)] text-white shadow-[0_26px_60px_rgba(9,76,178,0.18)]">
          <div className="absolute inset-y-0 right-[-8rem] w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="relative space-y-4">
            <Badge className="text-white bg-white/15">Live Status</Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl font-[family-name:var(--font-heading)] text-4xl leading-tight text-white sm:text-5xl">
                Backoffice-MVP für ruhige Triage, klare Priorisierung und belastbare Removal-Steuerung.
              </h1>
              <p className="max-w-2xl font-[family-name:var(--font-body)] text-base leading-7 text-white/84">
                Eine Alexandria-konforme Operationsfläche mit nur einer dominanten Primärfläche, verdichteten Kennzahlen und unmittelbarem Zugriff auf die Support-Queue.
              </p>
            </div>
          </div>

          <div className="relative grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] bg-white/12 p-5 backdrop-blur-[20px]">
              <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.2em] text-white/72">Queue-Volumen</p>
              <p className="mt-3 font-[family-name:var(--font-heading)] text-3xl">{supportQueue.length} Fälle</p>
              <p className="mt-2 text-sm leading-6 text-white/76">Triage, Removal und Identitätsprüfung in einer priorisierten Arbeitsfläche.</p>
            </div>
            <div className="rounded-[1.75rem] bg-white/10 p-5 backdrop-blur-[20px]">
              <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.2em] text-white/72">SLA heute</p>
              <p className="mt-3 font-[family-name:var(--font-heading)] text-3xl">{supportQueue.filter((item) => item.slaRisk === 'risk' || item.slaRisk === 'breach').length} Risiken</p>
              <p className="mt-2 text-sm leading-6 text-white/76">Überfällige oder kurz vor Eskalation stehende Fälle bleiben sichtbar ohne Alarmismus.</p>
            </div>
            <div className="rounded-[1.75rem] bg-white/10 p-5 backdrop-blur-[20px]">
              <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.2em] text-white/72">Letzte Zuweisung</p>
              <p className="mt-3 font-[family-name:var(--font-heading)] text-3xl">{supportQueue.find((item) => item.assignedTo)?.assignedTo ?? 'Offen'}</p>
              <p className="mt-2 text-sm leading-6 text-white/76">Support- und Legal-Desks bleiben in derselben Arbeitslogik verbunden.</p>
            </div>
          </div>
        </Card>

        <Card tone="muted" className="space-y-5">
          <div className="space-y-2">
            <SectionLabel>Workspace Search</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">Fälle, Nutzerreferenzen und Eskalationen schnell wiederfinden.</h2>
          </div>
          <Input defaultValue={filterState.query || 'US-9921 · Removal'} aria-label="Support Queue durchsuchen" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" className="justify-start" onClick={refreshSupportQueue}>Queue laden · {filterState.sort.field} {filterState.sort.direction}</Button>
            <Button className="justify-start bg-[linear-gradient(135deg,#094cb2_0%,#3366cc_100%)]" onClick={handlePrioritize}>Priorität zuweisen</Button>
            <Button variant="secondary" className="justify-start" onClick={assignTopSupportRequest}>Top-Fall zuweisen</Button>
            <Button variant="secondary" className="justify-start" onClick={progressTopSupportRequest}>Top-Fall starten</Button>
          </div>
          <p className="text-sm leading-6 text-stone-600">{actionStatus}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {roleCapabilities.map((capability) => (
                <RbacAuditHintCard key={capability.role} title={capability.role} description="Rollen, Zweckbindung und Protokollpflicht bleiben in derselben Alexandria-Fläche lesbar." rbacLabel="RBAC-Zweckbindung" rbacScope={capability.scope} auditLabel="Audit-Semantik" auditEvent={`${capability.role.toLowerCase()}.access.scope`} retention={capability.audit} className="bg-[#f8f5ef]" />
              ))}
            </div>
          <div className="rounded-[1.75rem] bg-white/85 p-5">
            <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.2em] text-stone-500">Queue-Hinweis</p>
            <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">Sensitive Inhalte und Evidenzlücken bleiben als Guidance sichtbar, bevor Fälle an Nutzer oder Provider zurückgespielt werden. {activeReviewCount} aktive Review-Items speisen dieselbe semantische Queue-Basis.</p>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {supportMetrics.map((metric) => (
          <Card key={metric.label} tone="muted" className="space-y-4">
            <span className={`inline-flex rounded-full px-3 py-1 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.18em] ${metric.toneClassName}`}>
              {metric.label}
            </span>
            <div className="space-y-2">
              <h3 className="font-[family-name:var(--font-heading)] text-3xl text-stone-950">{metric.value}</h3>
              <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{metric.detail}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
        <Card tone="canvas" className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <SectionLabel>Support Queue</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">Aktive Fälle mit Priorität, Status und nächster Zuständigkeit.</h2>
            </div>
            <Button variant="secondary">Export CSV</Button>
          </div>

          <div className="overflow-x-auto rounded-[1.75rem] bg-[#f8f5ef] p-2">
            <table className="min-w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="text-stone-500">
                  {['Request', 'Priorität', 'Typ', 'Status', 'Zuständigkeit'].map((heading) => (
                    <th key={heading} className="px-4 py-3 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em]">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {supportQueue.map((item) => <SupportQueueRow key={item.id} item={item} />)}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card tone="muted" className="space-y-5">
            <div className="space-y-2">
              <SectionLabel>Activity Feed</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">Letzte Statuswechsel und Eskalationssignale.</h2>
            </div>
            <div className="space-y-4">
              {activityFeed.length === 0 ? (
                <div className="rounded-[1.5rem] bg-white/85 p-5">
                  <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                    Noch keine operativen Aktivitätsdaten geladen.
                  </p>
                </div>
              ) : activityFeed.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] bg-white/85 p-5">
                  <div className="flex items-start gap-3">
                    <span className={`mt-2 inline-flex h-2.5 w-2.5 rounded-full ${toneDotClassNames[item.tone]}`} />
                    <div className="space-y-2">
                      <p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{item.title}</p>
                      <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{item.detail}</p>
                      <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{item.meta}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card tone="canvas" className="space-y-5">
            <div className="space-y-2">
              <SectionLabel>Outcome Actions</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">Review-Outcomes werden als RBAC- und Audit-nahe Aktionsbausteine vorbereitet.</h2>
            </div>
            <ReviewOutcomeActionPanel
              title="Outcome-Aktionen"
              description="Nächste Schritte, Audit-Semantik und Rollenhandover bleiben als eigene UI-Fläche gekapselt statt direkt im Seitenlayout verteilt."
              items={reviewOutcomeActions.map((item) => {
                const actionState = outcomeActionStates[item.outcome] ?? {
                  status: 'blocked',
                  label: 'Unbekannt',
                  hint: 'Keine Statuszuordnung vorhanden.',
                };

                return {
                  ...item,
                  actionLabel: `${item.actionLabel} · ${actionState.label}`,
                  retention: `${item.retention} ${actionState.hint}`,
                  rbacLabel: 'RBAC-Handover',
                  auditLabel: 'Audit-Event & Retention',
                };
              })}
              badgeClassNames={[...outcomeActionBadgeClassNames]}
            />
          </Card>

          <Card tone="muted" className="space-y-5">
            <div className="space-y-2">
              <SectionLabel>Audit Lane</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">Auditierbare Aktionen entlang Review, Medienzugriff und Zuweisung.</h2>
            </div>
            <div className="space-y-3">
              {auditLane.map((item) => (
                <div key={item.event} className="space-y-3 rounded-[1.5rem] bg-white/85 p-5">
                  <p className="font-[family-name:var(--font-heading)] text-base text-stone-950">{item.event}</p>
                  <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{item.reason}</p>
                  <AuditRetentionPanel label="Retention-Regel" auditEvent={item.event} retention={item.retention} className="bg-[#f8f5ef]" />
                </div>
              ))}
            </div>
          </Card>

          <Card tone="canvas" className="space-y-5">
            <div className="space-y-2">
              <SectionLabel>Review Queue</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">Review, Search und Evidence teilen dieselben Entscheidungsobjekte.</h2>
            </div>
            <div className="space-y-3">
              {reviewQueue.map((item) => <ReviewDecisionCard key={item.id} item={item} />)}
            </div>
            <div className="rounded-[1.5rem] bg-[#f8f5ef] p-4">
              <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Review-Queue-Spezifikation</p>
              <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">Die Lane fokussiert eskalierte Review-Items mit gemeinsamer Evidenzsprache, finalen Outcomes und dokumentierter nächster Aktion statt generischer Dashboard-Dichte.</p>
            </div>
            <ReviewOutcomeGuidanceCard
              title="Komponentenstruktur"
              items={[
                'ReviewOutcomeActionPanel kapselt outcome-spezifische nächste Schritte.',
                'ReviewOutcomeActionCard bündelt RBAC-Scope und Audit-Retention je Outcome.',
                'ReviewOutcomeGuidanceCard dokumentiert die dedizierte UI-Struktur direkt neben der Review-Lane.',
              ]}
            />
          </Card>

          <Card tone="elevated" className="space-y-4">
            <SectionLabel>Review Guidance</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">Backoffice-MVP priorisiert nächste Aktion statt Werkzeugdichte.</h2>
            <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
              Die rechte Rail verdichtet SLA-Risiken, Eskalationen und Guidance zur Evidenzqualität, damit Support schneller entscheidet ohne Kontextwechsel in mehrere Oberflächen.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
