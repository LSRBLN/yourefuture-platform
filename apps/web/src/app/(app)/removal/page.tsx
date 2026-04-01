import Link from 'next/link';

import type { RemovalCaseRecord } from '@trustshield/core';
import { Badge, Button, Card, EvidenceSnapshotCard, FeatureCard, Input, RemovalCaseFlowCard, RemovalCaseRow } from '@trustshield/ui';

import { fetchRemovalCases } from '../../lib/trustshield-api';

const removalFlowSteps = [
  { label: 'Evidence prüfen', description: 'Primäre URL, Vollscreenshot und Retention-Hinweis vor Submission bestätigen.' },
  { label: 'Provider ansteuern', description: 'Webform, E-Mail oder Eskalationspfad auf Basis des Falls auslösen.' },
  { label: 'Rückfrage steuern', description: 'Nachforderungen direkt an Support und Review rückkoppeln.' },
] as const;

type SummaryCard = {
  label: string;
  value: string;
  detail: string;
  emphasis?: boolean;
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
      {children}
    </p>
  );
}

function buildSummaryCards(removalCases: RemovalCaseRecord[]) {
  const total = removalCases.length;
  const terminalStatuses = new Set(['removed', 'partially_removed', 'rejected', 'closed']);
  const completed = removalCases.filter((item) => terminalStatuses.has(item.status)).length;
  const active = total - completed;
  const evidenceGaps = removalCases.filter((item) => item.evidenceCoverage !== 'complete').length;
  const removalRate = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10;

  return [
    {
      label: 'Global Status',
      value: `${removalRate.toFixed(1).replace('.', ',')}%`,
      detail: 'Abschlussquote über alle aktuell bekannten Removal-Fälle.',
      emphasis: true,
    },
    {
      label: 'Aktive Requests',
      value: String(active),
      detail: 'Laufende Fälle mit offener Provider- oder Nutzeraktion.',
    },
    {
      label: 'Abgeschlossen',
      value: String(completed),
      detail: 'Entfernte, final geklärte oder abgeschlossene Fälle.',
    },
    {
      label: 'Evidence Gaps',
      value: String(evidenceGaps),
      detail: 'Fälle, die vor dem nächsten Provider-Schritt belastbare Evidenz brauchen.',
    },
  ] satisfies SummaryCard[];
}

export default async function RemovalPage() {
  const removalCases = await fetchRemovalCases();
  const summaryCards = buildSummaryCards(removalCases);
  const spotlightCase = removalCases[0];

  return (
    <div className="space-y-8 text-stone-900">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.85fr)]">
        <Card tone="muted" className="space-y-5">
          <Badge>Removal Center</Badge>
          <div className="space-y-3">
            <h1 className="max-w-3xl font-[family-name:var(--font-heading)] text-4xl leading-tight text-stone-950 sm:text-5xl">
              Laufende Löschfälle mit belastbarer Evidenz, Statusklarheit und ruhiger nächster Aktion steuern.
            </h1>
            <p className="max-w-2xl font-[family-name:var(--font-body)] text-base leading-7 text-stone-600">
              Die Fläche hängt jetzt direkt an der produktiven Removal-API: Fälle, Evidenz-Snapshots und Detailnavigation kommen nicht mehr aus Mocks.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Input defaultValue="Plattform, URL oder Fall-ID suchen" aria-label="Removal Cases durchsuchen" />
            <Button className="bg-[linear-gradient(135deg,#094cb2_0%,#3366cc_100%)]">Neuen Fall anlegen</Button>
          </div>
        </Card>

        <Card tone="elevated" className="space-y-4">
          <SectionLabel>Security & Retention</SectionLabel>
          <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
            Evidence und Retention bleiben Teil des operativen Flows.
          </h2>
          <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
            Fälle mit fehlender Primärevidenz oder sensiblen Anhängen werden vor dem nächsten Provider-Schritt sichtbar markiert, damit Removal und Datenschutzregeln konsistent bleiben.
          </p>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card
            key={card.label}
            tone={card.emphasis ? 'canvas' : 'muted'}
            className={card.emphasis ? 'space-y-4 bg-[linear-gradient(180deg,#ffffff_0%,#f1ece2_100%)]' : 'space-y-4'}
          >
            <SectionLabel>{card.label}</SectionLabel>
            <div className="space-y-2">
              <h2 className="font-[family-name:var(--font-heading)] text-4xl text-stone-950">{card.value}</h2>
              <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{card.detail}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,0.8fr)]">
        <Card tone="canvas" className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <SectionLabel>Active Deletion Requests</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
                Fälle nach Plattform, Evidenzlage und nächstem Schritt priorisieren.
              </h2>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary">Live aus API geladen</Button>
              <Button variant="secondary">Export folgt</Button>
            </div>
          </div>

          {removalCases.length === 0 ? (
            <FeatureCard className="space-y-3 bg-[#f8f5ef]">
              <p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">Noch keine Removal-Fälle vorhanden</p>
              <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                Sobald ein Fall über Intake, Support oder das Removal-Center erstellt wurde, erscheint er hier mit Echtzeitstatus, Evidenzlage und Detailnavigation.
              </p>
            </FeatureCard>
          ) : (
            <div className="space-y-4">
              {removalCases.map((item) => (
                <div key={item.id} className="space-y-3">
                  <RemovalCaseRow item={item} />
                  <div className="flex justify-end">
                    <Link
                      href={`/removal/${item.id}`}
                      className="inline-flex items-center justify-center rounded-2xl bg-[#094cb2] px-5 py-3 font-[family-name:var(--font-label)] text-sm font-semibold tracking-[0.14em] text-white shadow-[0_16px_32px_rgba(9,76,178,0.16)] transition-all duration-150 hover:bg-[#083f94]"
                    >
                      Falldetail öffnen
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-3">
            {removalFlowSteps.map((step, index) => (
              <FeatureCard key={step.label} className="space-y-3 bg-[#f8f5ef]">
                <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">
                  Flow {index + 1}
                </p>
                <p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{step.label}</p>
                <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{step.description}</p>
              </FeatureCard>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card tone="muted" className="space-y-4">
            <SectionLabel>Guidance Rail</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              Evidence-Snapshots bleiben direkt neben dem operativen Fall sichtbar.
            </h2>
            <div className="space-y-3">
              {removalCases.slice(0, 3).map((item) => (
                <EvidenceSnapshotCard key={item.id} snapshot={item.evidenceSnapshot} className="bg-white/85" />
              ))}
              <FeatureCard className="space-y-2 bg-white/85">
                <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">
                  Für Nutzer sichtbar
                </p>
                <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                  Vollscreenshot mit URL, Zeitstempel oder Archivhinweis ergänzen, damit Provider-Routing ohne Rückfrage fortgesetzt werden kann.
                </p>
              </FeatureCard>
            </div>
          </Card>

          <Card tone="canvas" className="space-y-5">
            <SectionLabel>Case Flow Spotlight</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              Ein Removal-Fall wird inkl. Zuständigkeit, Retention und nächster Aktion verdichtet.
            </h2>
            {spotlightCase ? (
              <RemovalCaseFlowCard item={spotlightCase} />
            ) : (
              <FeatureCard className="space-y-3 bg-[#f8f5ef]">
                <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                  Noch kein Fall für den Spotlight-Bereich vorhanden.
                </p>
              </FeatureCard>
            )}
          </Card>

          <Card tone="elevated" className="space-y-4">
            <SectionLabel>Action Rail</SectionLabel>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
              Retention-Hinweis vor Eskalation.
            </h2>
            <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
              Sensitive Anhänge nur so lange halten wie für Evidenz, Provider-Kommunikation und Audit-Bezug notwendig. Dadurch bleibt das Removal Center anschlussfähig für spätere Policy- und API-Anbindung.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
