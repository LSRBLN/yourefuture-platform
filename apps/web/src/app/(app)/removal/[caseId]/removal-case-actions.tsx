"use client";

import { useMemo, useState } from 'react';

import { Badge, Button, Card } from '@trustshield/ui';

import { getTrustshieldApiBaseUrl, getTrustshieldBridgeHeaders } from '../../../lib/trustshield-api';

type RemovalActionFlowState = 'draft' | 'submitting' | 'submitted' | 'escalated' | 'failed';

type RemovalCaseActionsProps = {
  caseId: string;
  platform: string;
};

const apiBaseUrl = getTrustshieldApiBaseUrl();
const authHeaders = getTrustshieldBridgeHeaders();

export function RemovalCaseActions({ caseId, platform }: RemovalCaseActionsProps) {
  const [actionFlowState, setActionFlowState] = useState<RemovalActionFlowState>('draft');

  const actionStateMeta = useMemo(() => {
    if (actionFlowState === 'submitting') {
      return {
        badgeClassName: 'bg-[#f3efe7] text-[#6d5e00]',
        label: 'Provider-Submit läuft',
        detail: 'Provider-Kommunikation wird vorbereitet und revisionsfähig im Audit-Pfad dokumentiert.',
      };
    }

    if (actionFlowState === 'submitted') {
      return {
        badgeClassName: 'bg-[#e9f3ec] text-[#1f6b45]',
        label: 'Provider-Submit bestätigt',
        detail: 'Die API hat den Removal-Fall fortgeschrieben und den Folgeschritt aktualisiert.',
      };
    }

    if (actionFlowState === 'escalated') {
      return {
        badgeClassName: 'bg-[#fbefee] text-[#a0362f]',
        label: 'Legal-Eskalation aktiv',
        detail: 'Der Fall wurde über die API in den eskalierten Folgezustand überführt.',
      };
    }

    if (actionFlowState === 'failed') {
      return {
        badgeClassName: 'bg-[#fbefee] text-[#a0362f]',
        label: 'Aktion fehlgeschlagen',
        detail: 'Die API-Aktion konnte nicht bestätigt werden. Bitte erneut versuchen oder im Backoffice prüfen.',
      };
    }

    return {
      badgeClassName: 'bg-[#eef3fb] text-[#094cb2]',
      label: 'Action-Entwurf bereit',
      detail: 'Nächste Aktion wird direkt über den produktiven Removal-Endpunkt ausgelöst.',
    };
  }, [actionFlowState]);

  async function submitAction(payload: {
    actionType: string;
    recipient: string;
    payloadSummary: string;
    resultStatus: 'submitted' | 'escalated';
  }) {
    setActionFlowState(payload.resultStatus === 'submitted' ? 'submitting' : 'draft');

    const response = await fetch(`${apiBaseUrl}/api/v1/removal-cases/${caseId}/actions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setActionFlowState('failed');
      return;
    }

    setActionFlowState(payload.resultStatus === 'submitted' ? 'submitted' : 'escalated');
  }

  return (
    <Card tone="muted" className="space-y-5">
      <div className="space-y-3">
        <Badge>Removal Case Detail</Badge>
        <h1 className="font-[family-name:var(--font-heading)] text-4xl leading-tight text-stone-950 sm:text-5xl">
          Falldetail für {caseId} mit Evidence-, Zuständigkeits- und Retention-Fokus.
        </h1>
        <p className="max-w-3xl font-[family-name:var(--font-body)] text-base leading-7 text-stone-600">
          Provider-Kommunikation und Eskalation laufen direkt über die produktive API und bleiben mit Audit- und Retention-Hinweisen verbunden.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          onClick={() =>
            submitAction({
              actionType: 'webform_notice',
              recipient: platform,
              payloadSummary: 'Provider-Kommunikation aus Removal Detail ausgelöst',
              resultStatus: 'submitted',
            })
          }
          disabled={actionFlowState === 'submitting'}
        >
          {actionFlowState === 'submitting' ? 'Sende an Provider …' : 'Provider-Kommunikation öffnen'}
        </Button>
        <Button
          onClick={() =>
            submitAction({
              actionType: 'legal_escalation',
              recipient: 'Legal Desk',
              payloadSummary: 'Legal-Eskalation aus Removal Detail ausgelöst',
              resultStatus: 'escalated',
            })
          }
        >
          Folgeaktion vorbereiten
        </Button>
      </div>
      <div className="rounded-[1.5rem] bg-white/85 p-4">
        <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">
          Action-Flow Status
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Badge className={actionStateMeta.badgeClassName}>{actionStateMeta.label}</Badge>
          <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">
            {actionStateMeta.detail}
          </p>
        </div>
      </div>
    </Card>
  );
}
