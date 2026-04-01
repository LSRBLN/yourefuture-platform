"use client";

import { useMemo, useState } from 'react';

import type {
  CheckType,
  ContractValidationIssue,
  ContractValidationResult,
  CreateCheckRequestContract,
  CreateSourceRequestContract,
  CreateSupportRequestContract,
  ReviewPriority,
  SourceType,
  SupportRequestType,
} from '@trustshield/core';
import { defaultSearchFilterState, mockUnifiedSearchRecords, selectSearchRecords } from '@trustshield/core';
import { Badge, Button, Card, FeatureCard, FieldGroup, Input, IntakeErrorPanel, Modal, RbacAuditHintCard, SearchEvidenceCard, SearchResultCard, Stepper, ValidationIssueList } from '@trustshield/ui';
import { safeParseCreateCheckRequest, safeParseCreateSourceRequest, safeParseCreateSupportRequest } from '@trustshield/validation';

type ConcernType = 'leak-check' | 'image-check' | 'video-check' | 'report-source' | 'request-help';
type IntakeFieldKey = 'url' | 'source' | 'visibility' | 'affectedPerson' | 'summary';
type UploadState = 'ready' | 'processing' | 'attention' | 'failed';

type ConcernOption = {
  id: ConcernType;
  title: string;
  summary: string;
  intakeLabel: string;
};

type IntakeField = {
  key: IntakeFieldKey;
  label: string;
  hint: string;
  value: string;
  required?: boolean;
};

type EvidenceItem = {
  id: string;
  name: string;
  meta: string;
  state: UploadState;
  note: string;
  helper: string;
};

type EvidenceGuidance = {
  title: string;
  body: string;
  toneClassName: string;
};

type ConcernBlueprint = {
  checkType?: CheckType;
  sourceType?: SourceType;
  supportRequestType?: SupportRequestType;
  defaultPriority: ReviewPriority;
  queueIntent: string;
  legalBasisHint: string;
};

type IntakeState = {
  concern: ConcernType;
  fields: Record<IntakeFieldKey, IntakeField>;
  pii: string[];
  evidence: {
    items: EvidenceItem[];
    guidance: EvidenceGuidance[];
  };
};

type DraftReadinessCard = {
  label: string;
  status: 'valid' | 'invalid';
  value: string;
  issues: ContractValidationIssue[];
};

type ValidationLaneCard = {
  id: 'check' | 'source' | 'support';
  title: string;
  summary: string;
  result: ContractValidationResult<unknown>;
  severity: 'warning' | 'critical';
};

type ApiSubmissionState = 'idle' | 'ready' | 'submitting' | 'submitted';

type IntakeSubmitRequest = {
  concern: ConcernType;
  payload: {
    check: CreateCheckRequestContract;
    source: CreateSourceRequestContract;
    support: CreateSupportRequestContract;
  };
};

type IntakeSubmitResponse = {
  status: 'accepted';
  requestId: string;
  concern: ConcernType;
  created: {
    checkId: string;
    sourceId: string;
    supportRequestId: string;
  };
  queue: {
    reviewPriority: ReviewPriority;
    nextStep: string;
  };
  validation: {
    checkIssueCount: number;
    sourceIssueCount: number;
    supportIssueCount: number;
  };
};

type IntakeSubmitFailure = {
  status: 'error';
  message: string;
  details?: ContractValidationIssue[];
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_TRUSTSHIELD_API_URL ?? 'http://localhost:4000';

type ApiPreviewState = {
  endpoint: string;
  method: 'POST';
  payload: {
    check: CreateCheckRequestContract;
    source: CreateSourceRequestContract;
    support: CreateSupportRequestContract;
  };
};

type ApiResultState = {
  endpoint: string;
  method: 'POST';
  request: IntakeSubmitRequest;
  response: IntakeSubmitResponse | IntakeSubmitFailure;
};

const concernOptions: ConcernOption[] = [
  {
    id: 'leak-check',
    title: 'Leak-Check',
    summary: 'Prüft archivierte Seiten, Suchtreffer und Dokumente auf personenbezogene Leaks.',
    intakeLabel: 'Leak-Check',
  },
  {
    id: 'image-check',
    title: 'Bild-Check',
    summary: 'Analysiert öffentliche Bilder auf sensible Inhalte, Re-Uploads und Erkennbarkeit.',
    intakeLabel: 'Bild-Check',
  },
  {
    id: 'video-check',
    title: 'Video-Check',
    summary: 'Bewertet Videoquellen, Snippets und Plattformspuren mit ruhiger Priorisierung.',
    intakeLabel: 'Video-Check',
  },
  {
    id: 'report-source',
    title: 'Fund melden',
    summary: 'Erfasst einen einzelnen Fund mit Link, Kontext und priorisierter Einordnung.',
    intakeLabel: 'Fund melden',
  },
  {
    id: 'request-help',
    title: 'Hilfe anfragen',
    summary: 'Startet eine geführte Intake-Anfrage für Beratung, Nachweise und nächste Schritte.',
    intakeLabel: 'Hilfe anfragen',
  },
];

const piiOptions = ['Vollständiger Name', 'Adresse', 'Telefonnummer', 'Finanzdaten', 'Biometrische Daten', 'Ausweisnummer'];

const concernBlueprints: Record<ConcernType, ConcernBlueprint> = {
  'leak-check': {
    checkType: 'leak_domain',
    sourceType: 'document_url',
    supportRequestType: 'support',
    defaultPriority: 'high',
    queueIntent: 'Leak-Triage mit möglicher Übergabe an Review und Removal.',
    legalBasisHint: 'Archivierte oder indexierte personenbezogene Inhalte brauchen belastbare URL- und Evidenzkopplung.',
  },
  'image-check': {
    checkType: 'image',
    sourceType: 'image_url',
    supportRequestType: 'upload_review',
    defaultPriority: 'high',
    queueIntent: 'Bildfund mit Asset-/Source-Kopplung für spätere Match- und Review-Objekte.',
    legalBasisHint: 'Bildprüfungen benötigen Asset- oder Quellreferenz als Kern des Check-DTO.',
  },
  'video-check': {
    checkType: 'video',
    sourceType: 'video_url',
    supportRequestType: 'upload_review',
    defaultPriority: 'urgent',
    queueIntent: 'Video-Triage mit erhöhter Eskalationswahrscheinlichkeit bei Wiederveröffentlichung.',
    legalBasisHint: 'Videoquellen sollen für Review und Support mit identischer Fund-URL dokumentiert werden.',
  },
  'report-source': {
    checkType: 'source_only',
    sourceType: 'other_url',
    supportRequestType: 'support',
    defaultPriority: 'medium',
    queueIntent: 'Einzelfund direkt als Source-DTO mit optionalem Source-only-Check strukturieren.',
    legalBasisHint: 'Der gemeldete Fund bleibt zunächst quellengeführt, bevor Removal oder Review entstehen.',
  },
  'request-help': {
    checkType: 'source_only',
    sourceType: 'other_url',
    supportRequestType: 'removal',
    defaultPriority: 'urgent',
    queueIntent: 'Support-zentrierter Intake mit klarer Handover-Spur in Queue und Audit.',
    legalBasisHint: 'Hilfeanfragen sollen Kontaktweg, Nachricht und Fallbezug früh sauber strukturieren.',
  },
};

const initialIntakeState: IntakeState = {
  concern: 'leak-check',
  fields: {
    url: {
      key: 'url',
      label: 'Beanstandete URL',
      hint: 'Verwenden Sie den vollständigen Link zum Suchtreffer, Archiv oder Dokument.',
      value: 'https://example.org/archive/personenprofil',
      required: true,
    },
    source: {
      key: 'source',
      label: 'Plattform / Quelle',
      hint: 'Nennen Sie Quelle oder Archiv, damit Triage und Removal auf denselben Ursprung referenzieren.',
      value: 'Wayback Machine',
      required: true,
    },
    visibility: {
      key: 'visibility',
      label: 'Sichtbarkeit seit',
      hint: 'Beschreiben Sie, seit wann der Inhalt öffentlich auffindbar oder reproduzierbar wirkt.',
      value: 'Seit mehr als 12 Monaten öffentlich auffindbar',
    },
    affectedPerson: {
      key: 'affectedPerson',
      label: 'Betroffene Person',
      hint: 'Hilft der späteren rechtlichen Einordnung und dem Fallrouting.',
      value: 'Natürliche Person / Privatperson',
    },
    summary: {
      key: 'summary',
      label: 'Kurze Schilderung',
      hint: 'Knapp beschreiben, warum der Fund relevant ist und wie er öffentlich erreichbar bleibt.',
      value:
        'Der Treffer zeigt vollständigen Namen und Wohnort in einem archivierten Vereinsprotokoll. Die Seite ist weiterhin über Suchmaschinen und Archivkopien ohne Zugangshürde abrufbar.',
      required: true,
    },
  },
  pii: ['Vollständiger Name', 'Adresse'],
  evidence: {
    items: [
      {
        id: 'primary-screenshot',
        name: 'screenshot-archivfund.png',
        meta: 'PNG · 2,4 MB · Primärevidenz',
        state: 'ready',
        note: 'Bereit für Intake',
        helper: 'Vorschau erzeugt, URL und sichtbarer Namensblock stimmen mit dem Formular überein.',
      },
      {
        id: 'supporting-note',
        name: 'suchtreffer-notizen.pdf',
        meta: 'PDF · 640 KB · Kontextdatei',
        state: 'processing',
        note: 'OCR in Vorbereitung',
        helper: 'Die PDF wird für Zitate und Zeitmarken vorbereitet, bleibt aber Sekundärevidenz.',
      },
      {
        id: 'cropped-evidence',
        name: 'ausschnitt-ohne-zeitstempel.jpg',
        meta: 'JPG · 780 KB · benötigt Prüfung',
        state: 'attention',
        note: 'Hinweis erforderlich',
        helper: 'Der Ausschnitt zeigt den Leak, aber kein Datum. Ergänzen Sie einen Vollscreenshot oder Kontextnotiz.',
      },
      {
        id: 'html-export',
        name: 'webexport.html',
        meta: 'HTML · 5,2 MB · Upload abgelehnt',
        state: 'failed',
        note: 'Format derzeit nicht unterstützt',
        helper: 'Bitte stattdessen PDF, PNG, JPG oder einen sichtbaren Vollscreenshot verwenden.',
      },
    ],
    guidance: [
      {
        title: 'Synchronisation mit dem Fund',
        body: 'Evidenz sollte dieselbe URL wie im Formular referenzieren, damit OCR, Triage und spätere Removal-Workflows ohne Rückfragen anschließen können.',
        toneClassName: 'bg-[#f1ece2] text-stone-700',
      },
      {
        title: 'Belastbare Primärevidenz',
        body: 'Zeitstempel, Browserleiste oder Archivhinweis sichtbar halten. Markierungen sparsam einsetzen und keine alarmistische Hervorhebung nutzen.',
        toneClassName: 'bg-[#eef3fb] text-[#094cb2]',
      },
      {
        title: 'Fehler vermeidbar machen',
        body: 'Wenn Dateityp, Größe oder Kontext nicht ausreichen, sollte der nächste sinnvolle Schritt direkt an der Queue erklärt werden.',
        toneClassName: 'bg-[#f6ede9] text-[#8a4b22]',
      },
    ],
  },
};

const fieldOrder: IntakeFieldKey[] = ['url', 'source', 'visibility', 'affectedPerson'];

const uploadStateBadgeClassNames: Record<UploadState, string> = {
  ready: 'bg-[#e8eefb] text-[#094cb2]',
  processing: 'bg-[#f3efe7] text-[#6d5e00]',
  attention: 'bg-[#f6ede9] text-[#8a4b22]',
  failed: 'bg-[#f8e8e7] text-[#a0362f]',
};

const uploadStateSurfaceClassNames: Record<UploadState, string> = {
  ready: 'bg-[#f8f5ef]',
  processing: 'bg-[#f6f1e7]',
  attention: 'bg-[#fbf4ee]',
  failed: 'bg-[#fbefee]',
};

const draftStatusBadgeClassNames: Record<DraftReadinessCard['status'], string> = {
  valid: 'bg-[#e9f3ec] text-[#1f6b45]',
  invalid: 'bg-[#f8e8e7] text-[#a0362f]',
};

function getPrimaryIssue(issues: ContractValidationIssue[]) {
  return issues[0]?.message ?? 'Keine Fehler erkannt';
}

function getValidationSummary(issues: ContractValidationIssue[]) {
  if (issues.length === 0) {
    return 'Keine Fehler erkannt';
  }

  if (issues.length === 1) {
    return '1 Validierungsproblem blockiert den nächsten DTO-Schritt.';
  }

  return `${issues.length} Validierungsprobleme müssen vor dem Handover geklärt werden.`;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
      {children}
    </p>
  );
}

export default function NewCheckPage() {
  const [intakeState, setIntakeState] = useState<IntakeState>(initialIntakeState);
  const [apiSubmissionState, setApiSubmissionState] = useState<ApiSubmissionState>('idle');
  const [apiResult, setApiResult] = useState<ApiResultState | null>(null);
  const intakeLinkedRecords = selectSearchRecords(mockUnifiedSearchRecords, {
    ...defaultSearchFilterState,
    platforms: ['Archivmirror', 'Whitepages'],
    includeSensitive: false,
  }).slice(0, 2);

  const selectedConcernMeta = useMemo(
    () => concernOptions.find((option) => option.id === intakeState.concern) ?? concernOptions[0],
    [intakeState.concern],
  );
  const selectedBlueprint = concernBlueprints[intakeState.concern];

  const requiredFieldKeys = useMemo(
    () => Object.values(intakeState.fields).filter((field) => field.required).map((field) => field.key),
    [intakeState.fields],
  );

  const missingRequiredFields = requiredFieldKeys.filter((key) => intakeState.fields[key].value.trim().length === 0);
  const canContinue = missingRequiredFields.length === 0;
  const evidenceCounts = intakeState.evidence.items.reduce(
    (accumulator, item) => {
      accumulator[item.state] += 1;
      return accumulator;
    },
    { ready: 0, processing: 0, attention: 0, failed: 0 } as Record<UploadState, number>,
  );
  const submittedSourceIds = intakeState.evidence.items.filter((item) => item.state !== 'failed').map((item) => item.id);
  const syntheticCheckAssetId = selectedBlueprint.checkType === 'image' || selectedBlueprint.checkType === 'video' ? 'asset-intake-primary' : undefined;
  const checkDraftPayload: CreateCheckRequestContract = {
    type: selectedBlueprint.checkType ?? 'source_only',
    input: {
      domain: selectedBlueprint.checkType === 'leak_domain' ? intakeState.fields.source.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9.-]/g, '') || 'archive.example.org' : undefined,
      assetId: syntheticCheckAssetId,
      submittedSourceIds,
    },
  };
  const sourceDraftPayload: CreateSourceRequestContract = {
    sourceType: selectedBlueprint.sourceType ?? 'other_url',
    sourceUrl: intakeState.fields.url.value,
    platformName: intakeState.fields.source.value,
    pageTitle: `${selectedConcernMeta.title} · ${intakeState.fields.affectedPerson.value}`,
    notes: intakeState.fields.summary.value,
    checkId: 'check-draft-intake',
    assetId: syntheticCheckAssetId,
  };
  const supportDraftPayload: CreateSupportRequestContract = {
    requestType: selectedBlueprint.supportRequestType ?? 'support',
    priority: selectedBlueprint.defaultPriority,
    checkId: 'check-draft-intake',
    assetId: syntheticCheckAssetId,
    message: intakeState.fields.summary.value,
    preferredContact: 'secure_portal',
  };
  const checkDraftResult = safeParseCreateCheckRequest(checkDraftPayload);
  const sourceDraftResult = safeParseCreateSourceRequest(sourceDraftPayload);
  const supportDraftResult = safeParseCreateSupportRequest(supportDraftPayload);
  const validationLanes: ValidationLaneCard[] = [
    {
      id: 'check',
      title: 'Check-Contract',
      summary: 'Check-Typ, Input-Semantik und verknüpfte Quellen bleiben für Review und Worker deckungsgleich.',
      result: checkDraftResult,
      severity: 'critical',
    },
    {
      id: 'source',
      title: 'Source-Contract',
      summary: 'Fund-URL, Plattformbezug und Asset-/Check-Anker müssen für Intake und Persistenz nachvollziehbar bleiben.',
      result: sourceDraftResult,
      severity: 'warning',
    },
    {
      id: 'support',
      title: 'Support-Contract',
      summary: 'Nachrichten- und Routingdaten bleiben sichtbar, bevor ein operativer Support-Case entsteht.',
      result: supportDraftResult,
      severity: 'warning',
    },
  ];
  const dtoReadiness: DraftReadinessCard[] = [
    {
      label: 'Check DTO',
      status: checkDraftResult.success ? 'valid' : 'invalid',
      value: checkDraftPayload.type,
      issues: checkDraftResult.success ? [] : checkDraftResult.issues,
    },
    {
      label: 'Source DTO',
      status: sourceDraftResult.success ? 'valid' : 'invalid',
      value: sourceDraftPayload.sourceType,
      issues: sourceDraftResult.success ? [] : sourceDraftResult.issues,
    },
    {
      label: 'Support DTO',
      status: supportDraftResult.success ? 'valid' : 'invalid',
      value: supportDraftPayload.requestType,
      issues: supportDraftResult.success ? [] : supportDraftResult.issues,
    },
  ];
  const hasValidationErrors = dtoReadiness.some((entry) => entry.status === 'invalid');
  const failedEvidenceItems = intakeState.evidence.items.filter((item) => item.state === 'failed');
  const attentionEvidenceItems = intakeState.evidence.items.filter((item) => item.state === 'attention');
  const intakeErrorItems = [
    ...missingRequiredFields.map((fieldKey) => ({
      label: intakeState.fields[fieldKey].label,
      detail: `${intakeState.fields[fieldKey].hint} Der nächste Schritt bleibt bewusst gesperrt, bis das Pflichtfeld nachvollziehbar ergänzt wurde.`,
    })),
    ...validationLanes
      .filter((lane) => !lane.result.success)
      .flatMap((lane) => lane.result.issues.map((issue) => ({ label: `${lane.title} · ${issue.path || 'root'}`, detail: issue.message }))),
    ...attentionEvidenceItems.map((item) => ({ label: item.name, detail: item.helper })),
    ...failedEvidenceItems.map((item) => ({ label: item.name, detail: item.helper })),
  ];
  const showIntakeErrors = intakeErrorItems.length > 0;
  const apiReady = canContinue && !hasValidationErrors;
  const apiEndpoint = '/intake/orchestrator';
  const apiMethod = 'POST';
  const apiPreview: ApiPreviewState = {
    endpoint: apiEndpoint,
    method: apiMethod,
    payload: {
      check: checkDraftPayload,
      source: sourceDraftPayload,
      support: supportDraftPayload,
    },
  };

  function updateConcern(concern: ConcernType) {
    setIntakeState((current) => ({ ...current, concern }));
  }

  function updateField(field: IntakeFieldKey, value: string) {
    setIntakeState((current) => ({
      ...current,
      fields: {
        ...current.fields,
        [field]: {
          ...current.fields[field],
          value,
        },
      },
    }));
  }

  function togglePii(option: string) {
    setIntakeState((current) => ({
      ...current,
      pii: current.pii.includes(option)
        ? current.pii.filter((entry) => entry !== option)
        : [...current.pii, option],
    }));
  }

  function simulateApiPreparation() {
    setApiResult(null);
    setApiSubmissionState(apiReady ? 'ready' : 'idle');
  }

  function loadExampleEvidence() {
    setIntakeState((current) => ({
      ...current,
      evidence: {
        ...current.evidence,
        items: current.evidence.items.map((item) => {
          if (item.id === 'supporting-note') {
            return {
              ...item,
              state: 'ready',
              note: 'Bereit für Intake',
              helper: 'OCR wurde simuliert abgeschlossen und die Datei kann als ergänzende Evidenz angedockt werden.',
            };
          }

          if (item.id === 'cropped-evidence') {
            return {
              ...item,
              state: 'ready',
              note: 'Kontext ergänzt',
              helper: 'Ein Vollscreenshot wurde simuliert ergänzt, wodurch der Ausschnitt jetzt für Review und Removal anschlussfähig bleibt.',
            };
          }

          return item;
        }),
      },
    }));
    setApiSubmissionState('idle');
    setApiResult(null);
  }

  function hydrateConcernTemplate(concern: ConcernType) {
    const templateByConcern: Record<ConcernType, Partial<Record<IntakeFieldKey, string>>> = {
      'leak-check': {
        url: 'https://example.org/archive/personenprofil',
        source: 'Wayback Machine',
        summary: 'Der Treffer zeigt vollständigen Namen und Wohnort in einem archivierten Vereinsprotokoll.',
      },
      'image-check': {
        url: 'https://images.example.org/post/hidden-profile',
        source: 'Mirrorboard',
        summary: 'Ein öffentlich erreichbares Bild zeigt die betroffene Person weiterhin in re-uploadeten Treffern.',
      },
      'video-check': {
        url: 'https://video.example.org/watch/republished-snippet',
        source: 'ClipShare',
        summary: 'Ein Video-Snippet ist trotz früherer Meldung erneut öffentlich erreichbar und benötigt Review-Handover.',
      },
      'report-source': {
        url: 'https://forum.example.org/thread/fundmeldung',
        source: 'Archivmirror',
        summary: 'Ein einzelner Fund wurde dokumentiert und soll zunächst als Quelle mit belastbarer Kontextnotiz erfasst werden.',
      },
      'request-help': {
        url: 'https://support.example.org/case/republication',
        source: 'Support Desk',
        summary: 'Die betroffene Person benötigt Hilfe bei Einordnung, Evidenznachreichung und möglicher Removal-Vorbereitung.',
      },
    };

    const template = templateByConcern[concern];

    setIntakeState((current) => ({
      ...current,
      concern,
      fields: {
        ...current.fields,
        url: { ...current.fields.url, value: template.url ?? current.fields.url.value },
        source: { ...current.fields.source, value: template.source ?? current.fields.source.value },
        summary: { ...current.fields.summary, value: template.summary ?? current.fields.summary.value },
      },
    }));
    setApiSubmissionState('idle');
    setApiResult(null);
  }

  async function submitIntakeAdapter(request: IntakeSubmitRequest): Promise<IntakeSubmitResponse> {
    const checkValidation = safeParseCreateCheckRequest(request.payload.check);
    const sourceValidation = safeParseCreateSourceRequest(request.payload.source);
    const supportValidation = safeParseCreateSupportRequest(request.payload.support);

    const response = await fetch(`${apiBaseUrl}${apiEndpoint}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });
    const result = (await response.json()) as IntakeSubmitResponse | IntakeSubmitFailure;

    if (response.ok && result.status === 'accepted') {
      return {
        ...result,
        validation: {
          checkIssueCount: checkValidation.issues.length,
          sourceIssueCount: sourceValidation.issues.length,
          supportIssueCount: supportValidation.issues.length,
        },
      };
    }

    throw new Error(result.status === 'error' ? result.message : 'Intake-Orchestrator fehlgeschlagen.');
  }

  async function simulateSubmit() {
    if (!apiReady) {
      setApiSubmissionState('idle');
      setApiResult(null);
      return;
    }

    setApiSubmissionState('submitting');

    const request: IntakeSubmitRequest = {
      concern: intakeState.concern,
      payload: {
        check: checkDraftPayload,
        source: sourceDraftPayload,
        support: supportDraftPayload,
      },
    };

    try {
      const response = await submitIntakeAdapter(request);
      setApiResult({
        endpoint: apiEndpoint,
        method: apiMethod,
        request,
        response,
      });
      setApiSubmissionState('submitted');
    } catch (error) {
      setApiResult({
        endpoint: apiEndpoint,
        method: apiMethod,
        request,
        response: {
          status: 'error',
          message: error instanceof Error ? error.message : 'Intake-Orchestrator fehlgeschlagen.',
        },
      });
      setApiSubmissionState('ready');
    }
  }

  const summaryLength = intakeState.fields.summary.value.length;

  const apiStatusLabel = apiSubmissionState === 'idle' ? 'noch nicht bereit' : apiSubmissionState === 'ready' ? 'bereit zur Übergabe' : apiSubmissionState === 'submitting' ? 'API-Übergabe läuft' : 'API-Übergabe bestätigt';

  return (
    <div className="space-y-8 text-stone-900">
      <section className="space-y-5">
        <Badge>Intake · Alexandria</Badge>
        <div className="space-y-3">
          <h1 className="max-w-3xl font-[family-name:var(--font-heading)] text-4xl leading-tight text-stone-950 sm:text-5xl">
            Neuen Prüfauftrag mit präzisem Fund und ruhiger Kontextführung beginnen.
          </h1>
          <p className="max-w-2xl font-[family-name:var(--font-body)] text-base leading-7 text-stone-600">
            Diese Intake-Seite übersetzt den Stitch-Flow in Alexandria: klare Anliegenauswahl, reduzierte Primärfarbe,
            sanfte Surface-Hierarchie und eine evidenzorientierte Leak-Erfassung.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.85fr)]">
        <div className="space-y-6">
          <Card tone="muted" className="space-y-5">
            <div className="space-y-2">
              <SectionLabel>Intake-Fortschritt</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
                Ein einzelner Fund wird zuerst strukturiert, dann rechtlich eingeordnet.
              </h2>
            </div>
            <Stepper
              items={[
                { label: 'Anliegen wählen', description: 'Fokus des Auftrags festlegen', state: 'complete' },
                { label: 'Fund erfassen', description: 'Leak, Quelle und Evidenz ordnen', state: 'current' },
                { label: 'Rechtsgrundlagen', description: 'Anspruchsgrundlagen ergänzen', state: 'upcoming' },
              ]}
            />
          </Card>

          <Card tone="muted" className="space-y-5">
            <div className="space-y-2">
              <SectionLabel>Anliegenauswahl</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
                Welches Anliegen möchten Sie zuerst prüfen?
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {concernOptions.map((option) => (
                <FeatureCard
                  key={option.id}
                  className={intakeState.concern === option.id ? 'space-y-3 bg-[#f8f5ef] shadow-[0_18px_40px_rgba(28,36,48,0.05)]' : 'space-y-3'}
                  role="button"
                  tabIndex={0}
                  onClick={() => updateConcern(option.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      hydrateConcernTemplate(option.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-[family-name:var(--font-heading)] text-lg text-stone-900">{option.title}</h3>
                    {intakeState.concern === option.id ? <Badge className="bg-[#094cb2] text-white">Aktiv</Badge> : null}
                  </div>
                  <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{option.summary}</p>
                </FeatureCard>
              ))}
            </div>
          </Card>

          <Card className="space-y-8">
            <div className="space-y-2">
              <SectionLabel>{selectedConcernMeta.intakeLabel}</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
                Den betroffenen Fund mit Link, Plattform und Evidenz beschreiben.
              </h2>
              <p className="max-w-2xl font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                Der Intake-State folgt einer klaren Schema-Struktur aus Anliegen, Feldern, Kategorien und Evidence-Queue.
                Dadurch bleibt der Übergang in API-, Review- und Rechts-Workflows belastbar.
              </p>
              <div className="grid gap-3 lg:grid-cols-3">
                {dtoReadiness.map((entry) => (
                  <div key={entry.label} className="rounded-[1.25rem] bg-[#f8f5ef] px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{entry.label}</p>
                      <Badge className={draftStatusBadgeClassNames[entry.status]}>{entry.status === 'valid' ? 'validiert' : 'Fehler'}</Badge>
                    </div>
                    <p className="mt-2 font-[family-name:var(--font-heading)] text-base text-stone-900">{entry.value}</p>
                    <p className="mt-2 font-[family-name:var(--font-body)] text-xs leading-5 text-stone-600">{getPrimaryIssue(entry.issues)}</p>
                  </div>
                ))}
              </div>
              {hasValidationErrors ? (
                <div className="rounded-[1.5rem] bg-[#fbefee] px-5 py-4">
                  <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a0362f]">
                    SafeParse-Fehlerzustände
                  </p>
                  <div className="mt-3 space-y-3">
                    {dtoReadiness.filter((entry) => entry.issues.length > 0).map((entry) => (
                      <div key={entry.label} className="rounded-[1.25rem] bg-white/80 px-4 py-3">
                        <p className="font-[family-name:var(--font-heading)] text-sm text-stone-950">{entry.label}</p>
                        <ValidationIssueList issues={entry.issues} className="mt-2 space-y-1" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-3 lg:grid-cols-3">
                {validationLanes.map((lane) => {
                  const isInvalid = !lane.result.success;

                  return (
                    <div key={lane.id} className={isInvalid ? 'rounded-[1.5rem] bg-white px-4 py-4 ring-1 ring-[#a0362f]/12' : 'rounded-[1.5rem] bg-white/75 px-4 py-4'}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">{lane.title}</p>
                          <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{lane.summary}</p>
                        </div>
                        <Badge className={isInvalid ? 'bg-[#fbefee] text-[#a0362f]' : 'bg-[#e9f3ec] text-[#1f6b45]'}>{isInvalid ? 'blockiert' : 'ok'}</Badge>
                      </div>
                      <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{getValidationSummary(lane.result.success ? [] : lane.result.issues)}</p>
                        {isInvalid ? <ValidationIssueList issues={lane.result.issues} className="mt-3" /> : null}
                    </div>
                  );
                })}
              </div>
              <RbacAuditHintCard title="RBAC- und Audit-Hinweise für Intake-Handover" description="Bevor ein Intake in Review, Support oder Removal übergeht, bleiben Zweckbindung, Audit-Event und Aufbewahrung im selben Informationsblock sichtbar." rbacLabel="Zugriff im nächsten Schritt" rbacScope="Support sieht Anfragekontext, Analyst nur evidenzbezogene Prüfung, Removal-Rollen erst nach belastbarer Empfehlung." auditLabel="Audit-Pfad" auditEvent="intake.contract.safe_parse_review" retention="Validierungsfehler, Handover-Entscheidung und spätere Nutzerhinweise müssen nachvollziehbar und zweckgebunden protokolliert bleiben." emphasis={hasValidationErrors ? 'warning' : 'default'} />
              <div className="rounded-[1.5rem] bg-[#f8f5ef] px-5 py-4">
                <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                  Aktives Anliegen
                </p>
                <p className="mt-2 font-[family-name:var(--font-heading)] text-lg text-stone-900">{selectedConcernMeta.title}</p>
                <p className="mt-1 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                  {selectedConcernMeta.summary}
                </p>
                <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{selectedBlueprint.queueIntent}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {intakeLinkedRecords.map((record) => (
                  <SearchResultCard key={record.id} record={record} />
                ))}
              </div>
              {showIntakeErrors ? (
                <IntakeErrorPanel title="Pflichtfelder, Guidance und Dateifehler bleiben vor dem Rechts-Flow sichtbar." summary="Die Oberfläche erklärt fehlende Angaben und problematische Evidenz ruhig, ohne alarmistische Interaktionsmuster. Dadurch bleibt klar, was vor dem nächsten Schritt ergänzt oder ersetzt werden muss." items={intakeErrorItems} />
              ) : null}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {fieldOrder.map((fieldKey) => {
                const field = intakeState.fields[fieldKey];

                return (
                  <FieldGroup key={field.key} label={field.label} hint={field.hint}>
                    <Input value={field.value} onChange={(event) => updateField(field.key, event.target.value)} />
                  </FieldGroup>
                );
              })}
            </div>

            <FieldGroup
              label="Erfasste sensible Kategorien"
              hint="Nur markieren, was im konkreten Fund sichtbar oder eindeutig ableitbar ist."
            >
              <div className="flex flex-wrap gap-3">
                {piiOptions.map((option) => (
                  <button key={option} type="button" onClick={() => togglePii(option)} className="rounded-full">
                    <Badge
                      className={
                        intakeState.pii.includes(option) ? 'bg-[#e8eefb] text-[#094cb2]' : 'bg-[#f1ece2] text-stone-700'
                      }
                    >
                      {option}
                    </Badge>
                  </button>
                ))}
              </div>
            </FieldGroup>

            <FieldGroup
              label={intakeState.fields.summary.label}
              hint={intakeState.fields.summary.hint}
              aside={<Badge className="bg-[#f1ece2] text-stone-700">{summaryLength} Zeichen</Badge>}
            >
              <textarea
                value={intakeState.fields.summary.value}
                onChange={(event) => updateField('summary', event.target.value)}
                className="min-h-[132px] w-full rounded-[1.75rem] bg-[#f8f5ef] px-5 py-4 font-[family-name:var(--font-body)] text-sm leading-7 text-stone-700 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#094cb2]/20"
              />
            </FieldGroup>

            <Card tone="muted" className="space-y-5">
              <div className="space-y-2">
                <SectionLabel>Evidence Desk</SectionLabel>
                <h3 className="font-[family-name:var(--font-heading)] text-xl text-stone-950">
                  Upload- und Evidenzbereich mit glaubwürdigen Zuständen und klarer Guidance.
                </h3>
                <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                  Die Oberfläche simuliert belastbare Queue-Zustände: bereit, in Verarbeitung, Hinweisbedarf und abgelehnt.
                  Dadurch werden Folgeaktionen plausibel, ohne bereits einen Persistenzlayer vorzutäuschen.
                </p>
              </div>

              <Modal className="space-y-4 bg-white/85">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <SectionLabel>Dropzone</SectionLabel>
                    <p className="font-[family-name:var(--font-heading)] text-lg text-stone-900">
                      Screenshot, PDF oder Export als ruhige Vorstufe für den Rechts-Flow ergänzen.
                    </p>
                    <p className="max-w-xl font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                      Lokale Dateien werden in dieser Migration nicht gespeichert. Der Screen modelliert aber die späteren
                      Zustände aus Upload, Validierung, OCR-Hinweis und Dateifehlern bereits explizit.
                    </p>
                  </div>
                  <Badge className="bg-[#f1ece2] text-stone-700">Simulation · kein Persistenzlayer</Badge>
                </div>

                <div className="rounded-[1.75rem] bg-[#f8f5ef] px-6 py-8 text-center">
                  <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                    Alexandria Upload Surface
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-heading)] text-xl text-stone-950">
                    Dateien hineinziehen oder kuratiert aus lokaler Evidenz wählen.
                  </p>
                  <p className="mx-auto mt-3 max-w-2xl font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                    Empfohlen: vollständiger Screenshot, Original-URL als Dateiname oder begleitende PDF-Notiz mit Zeitpunkt,
                    Plattform und sichtbaren personenbezogenen Kategorien.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    <Badge className="bg-[#eef3fb] text-[#094cb2]">{evidenceCounts.ready} bereit</Badge>
                    <Badge className="bg-[#f3efe7] text-[#6d5e00]">{evidenceCounts.processing} in Prüfung</Badge>
                    <Badge className="bg-[#f6ede9] text-[#8a4b22]">{evidenceCounts.attention} mit Hinweis</Badge>
                    <Badge className="bg-[#f8e8e7] text-[#a0362f]">{evidenceCounts.failed} abgelehnt</Badge>
                  </div>
                  <div className="flex flex-col justify-center gap-3 mt-6 sm:flex-row">
                    <Button variant="secondary">Datei auswählen</Button>
                    <Button variant="ghost" className="px-5 bg-white/70 text-stone-600 hover:bg-white" onClick={loadExampleEvidence}>
                      Beispiel-Evidenz laden
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
                  <div className="space-y-3">
                    {intakeState.evidence.items.map((item) => (
                      <div key={item.id} className={`rounded-[1.5rem] px-5 py-4 ${uploadStateSurfaceClassNames[item.state]}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-[family-name:var(--font-heading)] text-base text-stone-900">{item.name}</p>
                            <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{item.meta}</p>
                          </div>
                          <Badge className={uploadStateBadgeClassNames[item.state]}>{item.note}</Badge>
                        </div>
                        <p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{item.helper}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {intakeState.evidence.guidance.map((entry) => (
                      <div key={entry.title} className={`rounded-[1.5rem] px-5 py-4 ${entry.toneClassName}`}>
                        <SectionLabel>{entry.title}</SectionLabel>
                        <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6">{entry.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Modal>

              <div className="grid gap-4 lg:grid-cols-2">
                <FeatureCard className="space-y-3 bg-[#f8f5ef]">
                  <SectionLabel>Queue-Übergang</SectionLabel>
                  <h4 className="font-[family-name:var(--font-heading)] text-lg text-stone-950">Intake, Search und Review teilen dieselbe Evidenzsprache.</h4>
                  <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                    Nach dem Absenden bleibt sichtbar, welche Search-Treffer schon belastbar sind und welche Nachreichung brauchen, bevor ein Review-Objekt erzeugt wird.
                  </p>
                  <div className="rounded-[1.25rem] bg-white/75 px-4 py-3">
                      <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Dokumentierter DTO-Pfad</p>
                      <ul className="mt-2 space-y-1 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">
                        <li>Check-Typ: {checkDraftPayload.type}</li>
                        <li>Source-Typ: {sourceDraftPayload.sourceType}</li>
                        <li>Support-Typ: {supportDraftPayload.requestType}</li>
                      </ul>
                    </div>
                  </FeatureCard>
                <SearchEvidenceCard record={intakeLinkedRecords[0] ?? mockUnifiedSearchRecords[0]} />
              </div>

              <Card tone="muted" className="space-y-4">
                <div className="space-y-2">
                  <SectionLabel>API-Handshake</SectionLabel>
                  <h3 className="font-[family-name:var(--font-heading)] text-xl text-stone-950">Interaktiver Draft-Handshake vor echter API-Anbindung.</h3>
                  <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">Die Oberfläche modelliert bereits Endpoint, Methode und Submit-Zustand, damit eine spätere Persistenzschicht ohne UI-Bruch andocken kann.</p>
                </div>
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div className="rounded-[1.5rem] bg-white/85 p-4">
                    <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Transport</p>
                    <p className="mt-2 font-[family-name:var(--font-heading)] text-base text-stone-950">{apiMethod} {apiEndpoint}</p>
                    <p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">Status: {apiStatusLabel}</p>
                    <p className="mt-2 font-[family-name:var(--font-body)] text-xs leading-5 text-stone-500">Nur valide Drafts wechseln in den simulierten API-Ready-Zustand.</p>
                  </div>
                  <div className="rounded-[1.5rem] bg-[#f8f5ef] p-4">
                    <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Payload-Vorschau</p>
                    <pre className="mt-2 overflow-x-auto font-mono text-xs leading-6 text-stone-700">{JSON.stringify(apiPreview, null, 2)}</pre>
                  </div>
                </div>
                {apiResult ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-[1.5rem] bg-white/85 p-4">
                      <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Adapter Request Mapping</p>
                      <pre className="mt-2 overflow-x-auto font-mono text-xs leading-6 text-stone-700">{JSON.stringify(apiResult.request, null, 2)}</pre>
                    </div>
                    <div className="rounded-[1.5rem] bg-[#f8f5ef] p-4">
                      <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Adapter Response Mapping</p>
                      <pre className="mt-2 overflow-x-auto font-mono text-xs leading-6 text-stone-700">{JSON.stringify(apiResult.response, null, 2)}</pre>
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" onClick={simulateApiPreparation}>Draft für API prüfen</Button>
                  <Button onClick={simulateSubmit} disabled={!apiReady || apiSubmissionState === 'submitting'}>{apiSubmissionState === 'submitting' ? 'Sende …' : apiSubmissionState === 'submitted' ? 'API bestätigt' : 'API-Übergabe starten'}</Button>
                </div>
              </Card>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button variant="ghost" className="justify-start px-0 tracking-[0.08em] text-stone-500 hover:bg-transparent">
                Entwurf sichern
              </Button>
              <div className="flex flex-col gap-3 sm:flex-row">
                 <Button variant="secondary" onClick={() => hydrateConcernTemplate(intakeState.concern)}>Später fortsetzen</Button>
                 <Button disabled={!canContinue}>Weiter zu Rechtsgrundlagen</Button>
               </div>
             </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card tone="muted" className="space-y-5">
            <div className="space-y-2">
              <SectionLabel>Kontextspalte</SectionLabel>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl leading-tight text-stone-950">
                Redaktionelle Orientierung statt lauter Systemsignale.
              </h2>
            </div>
            <p className="font-[family-name:var(--font-body)] text-sm leading-7 text-stone-600">
              Alexandria priorisiert Vertrauen durch ruhige Flächen. Hinweise, Metriken und Guidance liegen in abgestuften
              Oberflächen, nicht in harten Linien oder permanenten Alarmfarben.
            </p>
          </Card>

          <Card tone="elevated" className="space-y-4">
            <SectionLabel>Schema-Status</SectionLabel>
            <p className="font-[family-name:var(--font-body)] text-sm leading-7 text-stone-700">
              Der Screen trennt nun Anliegen, Formularfelder, PII-Kategorien und Evidence-Queue explizit. Check-, Source-
              und Support-Drafts werden per `safeParse` gegen die neue Contract-Schicht geprüft, wodurch echte Fehlerzustände
              sichtbar bleiben und nicht mehr durch sofortiges `parse` verdeckt werden.
            </p>
            <p className="font-[family-name:var(--font-body)] text-sm leading-7 text-stone-600">{selectedBlueprint.legalBasisHint}</p>
          </Card>

          <Card className="space-y-5">
            <SectionLabel>Bearbeitungsrahmen</SectionLabel>
            <div className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-[family-name:var(--font-body)] text-xs uppercase tracking-[0.16em] text-stone-500">
                    Durchschnittliche Erstprüfung
                  </p>
                  <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl text-stone-950">14 Tage</p>
                </div>
                <Badge className="bg-[#eef3fb] text-[#094cb2]">Q1-Referenz</Badge>
              </div>
              <div className="h-2 rounded-full bg-[#f1ece2]">
                <div className="h-2 w-[62%] rounded-full bg-[#094cb2]" />
              </div>
              <p className="font-[family-name:var(--font-body)] text-xs leading-5 text-stone-500">
                Die Primärfarbe erscheint nur als gezielter Fortschrittsakzent und beim finalen Haupt-Call-to-Action.
              </p>
            </div>
          </Card>

          <Card tone="muted" className="space-y-4">
            <SectionLabel>Nächste Intake-Schritte</SectionLabel>
            <ul className="space-y-3 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">
              <li>
                01 · {intakeState.fields.url.value ? 'Link und Quelle verifizieren' : 'Zuerst den beanstandeten Link ergänzen'}
              </li>
              <li>
                02 · {intakeState.pii.length > 0 ? `${intakeState.pii.length} Leak-Kategorie(n) eingegrenzt` : 'Leak-Kategorie eingrenzen'}
              </li>
              <li>
                03 ·{' '}
                {missingRequiredFields.length === 0
                  ? `${intakeState.evidence.items.length} Evidenzdatei(en) für die Rechtsgrundlagen vorbereitet`
                  : `${missingRequiredFields.length} Pflichtfeld(er) vor dem nächsten Schritt ergänzen`}
              </li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
}
