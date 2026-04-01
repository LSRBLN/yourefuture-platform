import { Badge, Card, EvidenceSnapshotCard, RbacAuditHintCard, RemovalCaseFlowCard } from '@trustshield/ui';

import { fetchRemovalCase } from '../../../lib/trustshield-api';
import { RemovalCaseActions } from './removal-case-actions';

const providerTimeline = [
  'Provider-Antwort ausstehend oder zuletzt bestätigt',
  'Evidenzsnapshot revisionsfähig gesichert',
  'Fallback-Eskalation an Legal bleibt mit Audit und Retention verknüpft',
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
      {children}
    </p>
  );
}

export default async function RemovalCaseDetailPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  const item = await fetchRemovalCase(caseId);

  if (!item) {
    return (
      <main className="space-y-8 text-stone-900">
        <Card tone="muted" className="space-y-4">
          <Badge>Removal Case Detail</Badge>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl text-stone-950">Falldetail nicht gefunden</h1>
          <p className="font-[family-name:var(--font-body)] text-base leading-7 text-stone-600">
            Der angeforderte Removal-Fall ist nicht sichtbar, wurde entfernt oder gehört nicht zum aktuellen Nutzerkontext.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-8 text-stone-900">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <RemovalCaseActions caseId={item.id} platform={item.platform} />

        <RbacAuditHintCard
          title="Zugriff und Audit"
          description="Sensitive Evidence und Provider-Historie bleiben nur für zuständige Rollen sichtbar."
          rbacLabel="Falldetail-RBAC"
          rbacScope="Owner, Support und Removal-Desk sehen operative Kommunikation; Reviewer sehen nur begründete Evidenz und Status."
          auditLabel="Audit-Event"
          auditEvent="removal.case.detail.view"
          retention={item.evidenceSnapshot.retentionNote}
          emphasis="warning"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.85fr)]">
        <Card tone="canvas" className="space-y-5">
          <div className="space-y-2">
            <SectionLabel>Case Flow</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              Status, Evidenzlage und nächste Aktion werden in einer Detailfläche verdichtet.
            </h2>
          </div>
          <RemovalCaseFlowCard item={item} />
        </Card>

        <Card tone="muted" className="space-y-5">
          <div className="space-y-2">
            <SectionLabel>Evidence Snapshot</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              Primärevidenz und Retention-Hinweis für das Detailrouting.
            </h2>
          </div>
          <EvidenceSnapshotCard snapshot={item.evidenceSnapshot} className="bg-white/85" />
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Card tone="muted" className="space-y-5">
          <div className="space-y-2">
            <SectionLabel>Provider Timeline</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              Kommunikationsspur, Eskalationsfenster und nächste Frist bleiben gemeinsam sichtbar.
            </h2>
          </div>
          <div className="space-y-3">
            {providerTimeline.map((entry) => (
              <div key={entry} className="rounded-[1.5rem] bg-white/85 p-4">
                <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{entry}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card tone="canvas" className="space-y-5">
          <div className="space-y-2">
            <SectionLabel>Retention & Handover</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              Operative Folgeaktionen werden mit Frist- und Aufbewahrungslogik vertieft.
            </h2>
          </div>
          <div className="rounded-[1.5rem] bg-[#f8f5ef] p-4">
            <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">
              Nächster Handover
            </p>
            <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">
              {item.nextActionLabel}
            </p>
            <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
              Retention-Hinweis: {item.evidenceSnapshot.retentionNote}
            </p>
          </div>
        </Card>
      </section>
    </main>
  );
}
