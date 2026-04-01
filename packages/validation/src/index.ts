import { z } from 'zod';

const uuidLikeSchema = z.string().min(1);
const isoDateTimeSchema = z.string().datetime({ offset: true });
const optionalTrimmedStringSchema = z.string().trim().min(1).optional();
const unknownRecordSchema = z.record(z.string(), z.unknown());

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
});

export type EnvironmentSchema = z.infer<typeof environmentSchema>;

export const sortDirectionSchema = z.enum(['asc', 'desc']);
export const searchExecutionStatusSchema = z.enum(['pending', 'queued', 'running', 'completed', 'partial_failure', 'failed', 'cancelled']);
export const checkTypeSchema = z.enum(['leak_email', 'leak_username', 'leak_phone', 'leak_domain', 'password_hash', 'image', 'video', 'source_only']);
export const checkStatusSchema = searchExecutionStatusSchema;
export const assetTypeSchema = z.enum(['image', 'video', 'document', 'other']);
export const assetStatusSchema = z.enum(['pending_upload', 'uploaded', 'scanning', 'ready', 'flagged', 'failed']);
export const sourceTypeSchema = z.enum(['profile_url', 'listing_url', 'image_url', 'video_url', 'document_url', 'social_post_url', 'other_url']);
export const sourceValidationStatusSchema = z.enum(['pending', 'validated', 'invalid', 'rejected']);
export const matchTypeSchema = z.enum(['exact_hash', 'perceptual_hash', 'face_match', 'video_match', 'text_match', 'listing_match', 'provider_hit', 'manual_report']);
export const workflowStatusSchema = z.enum(['active', 'completed', 'cancelled']);
export const workflowStepStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'skipped', 'blocked']);
export const removalCaseTypeSchema = z.enum(['privacy_removal', 'non_consensual_intimate_content', 'impersonation', 'defamation', 'copyright', 'other']);
export const reviewTypeSchema = z.enum(['analyst', 'support_escalation', 'removal_review']);
export const reviewPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const reviewStatusSchema = z.enum(['open', 'triaged', 'assigned', 'in_review', 'waiting_more_context', 'decided', 'escalated', 'closed']);
export const reviewDecisionOutcomeSchema = z.enum([
  'no_evidence_of_manipulation',
  'suspicious_needs_monitoring',
  'likely_manipulated',
  'confirmed_known_fake',
  'insufficient_evidence',
  'no_match',
  'weak_candidate',
  'strong_candidate_reviewed',
  'insufficient_quality',
  'not_actionable',
  'monitor',
  'action_recommended',
  'removal_recommended',
]);
export const recommendedActionSchema = z.enum(['monitor', 'rerun_analysis', 'request_more_context', 'handover_support', 'recommend_removal', 'legal_escalation']);
export const removalStatusSchema = z.enum(['open', 'preparing', 'submitted', 'under_review', 'followup_required', 'escalated', 'removed', 'partially_removed', 'rejected', 'closed']);
export const removalActionTypeSchema = z.enum(['email_notice', 'webform_notice', 'api_notice', 'followup', 'legal_escalation', 'internal_note']);
export const supportRequestTypeSchema = z.enum(['support', 'removal', 'upload_review', 'identity_review']);
export const supportStatusSchema = z.enum(['open', 'triaged', 'assigned', 'in_progress', 'waiting_user', 'escalated', 'resolved', 'closed']);
export const providerCategorySchema = z.enum(['leak', 'search', 'social', 'video', 'image', 'registry', 'other']);
export const providerStatusSchema = z.enum(['active', 'degraded', 'disabled', 'maintenance']);
export const evidenceCoverageSchema = z.enum(['complete', 'partial', 'missing']);
export const severitySchema = z.enum(['low', 'medium', 'high', 'critical']);
export const slaRiskSchema = z.enum(['healthy', 'watch', 'risk', 'breach']);
export const searchQueryTypeSchema = z.enum(['person', 'asset', 'url', 'platform']);
export const searchCandidateTypeSchema = z.enum(['profile', 'listing', 'image', 'video', 'document']);
export const searchRetrievalMethodSchema = z.enum(['exact', 'fuzzy', 'embedding', 'hybrid']);
export const searchSortFieldSchema = z.enum(['updatedAt', 'priority', 'slaRisk', 'score']);
export const assetRepresentationTypeSchema = z.enum(['exact_hash', 'phash', 'embedding', 'audio_fingerprint', 'transcript', 'ocr']);
export const textArtifactTypeSchema = z.enum(['ocr', 'transcript']);
export const evidenceSnapshotTypeSchema = z.enum(['search_result', 'review_brief', 'provider_packet']);
export const evidenceSourceKindSchema = z.enum(['url', 'screenshot', 'document', 'audit_log']);
export const evidenceSourceStatusSchema = z.enum(['verified', 'pending', 'missing']);
export const providerCapabilitySchema = z.enum(['search', 'match', 'review_export', 'removal_submission', 'status_sync']);

export const searchSortSchema = z.object({
  field: searchSortFieldSchema,
  direction: sortDirectionSchema,
});

export const searchFilterStateSchema = z.object({
  query: z.string(),
  statuses: z.array(searchExecutionStatusSchema),
  reviewPriorities: z.array(reviewPrioritySchema),
  evidenceCoverage: z.array(evidenceCoverageSchema),
  platforms: z.array(z.string().min(1)),
  assignedTo: z.array(z.string().min(1)),
  onlyEscalated: z.boolean(),
  includeSensitive: z.boolean(),
  sort: searchSortSchema,
});

export const reviewQueueFilterStateSchema = z.object({
  query: z.string(),
  priorities: z.array(reviewPrioritySchema),
  statuses: z.array(reviewStatusSchema),
  types: z.array(reviewTypeSchema),
  assignedTo: z.array(z.string().min(1)),
  evidenceCoverage: z.array(evidenceCoverageSchema),
  slaRisks: z.array(slaRiskSchema),
  linkedRemovalCaseIds: z.array(z.string().min(1)),
  linkedSupportRequestIds: z.array(z.string().min(1)),
  onlyUnassigned: z.boolean(),
  onlyEscalated: z.boolean(),
  sort: searchSortSchema,
});

export const removalFilterStateSchema = z.object({
  query: z.string(),
  statuses: z.array(removalStatusSchema),
  severities: z.array(severitySchema),
  evidenceCoverage: z.array(evidenceCoverageSchema),
  slaRisks: z.array(slaRiskSchema),
  platforms: z.array(z.string().min(1)),
  sort: searchSortSchema,
});

export const supportQueueFilterStateSchema = z.object({
  query: z.string(),
  priorities: z.array(reviewPrioritySchema),
  requestTypes: z.array(supportRequestTypeSchema),
  statuses: z.array(supportStatusSchema),
  assignedTo: z.array(z.string().min(1)),
  slaRisks: z.array(slaRiskSchema),
  sort: searchSortSchema,
});

export const timestampedRecordSchema = z.object({
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const summaryRecordSchema = z.object({
  summary: optionalTrimmedStringSchema,
});

export const checkInputSchema = z.object({
  email: optionalTrimmedStringSchema,
  username: optionalTrimmedStringSchema,
  phone: optionalTrimmedStringSchema,
  domain: optionalTrimmedStringSchema,
  passwordHashPrefix: optionalTrimmedStringSchema,
  assetId: optionalTrimmedStringSchema,
  submittedSourceIds: z.array(z.string().min(1)).optional(),
});

export const riskAssessmentSchema = z.object({
  score: z.number().min(0).max(100).optional(),
  severity: severitySchema.optional(),
  rationale: optionalTrimmedStringSchema,
  flaggedSignals: z.array(z.string().min(1)),
});

export const checkRecordSchema = timestampedRecordSchema.merge(summaryRecordSchema).extend({
  id: uuidLikeSchema,
  type: checkTypeSchema,
  status: checkStatusSchema,
  input: checkInputSchema,
  risk: riskAssessmentSchema,
  submittedSourceIds: z.array(z.string().min(1)),
  primaryAssetId: optionalTrimmedStringSchema,
  workflowInstanceId: optionalTrimmedStringSchema,
  supportRequestId: optionalTrimmedStringSchema,
  reviewItemIds: z.array(z.string().min(1)),
  removalCaseIds: z.array(z.string().min(1)),
}).superRefine((record, ctx) => {
  if (record.type === 'leak_email' && !record.input.email) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['input', 'email'], message: 'Für leak_email ist eine E-Mail erforderlich.' });
  }

  if (record.type === 'leak_username' && !record.input.username) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['input', 'username'], message: 'Für leak_username ist ein Username erforderlich.' });
  }

  if (record.type === 'leak_phone' && !record.input.phone) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['input', 'phone'], message: 'Für leak_phone ist eine Telefonnummer erforderlich.' });
  }

  if (record.type === 'leak_domain' && !record.input.domain) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['input', 'domain'], message: 'Für leak_domain ist eine Domain erforderlich.' });
  }

  if (record.type === 'password_hash' && !record.input.passwordHashPrefix) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['input', 'passwordHashPrefix'], message: 'Für password_hash ist ein Hash-Präfix erforderlich.' });
  }

  if ((record.type === 'image' || record.type === 'video') && !record.input.assetId && !record.primaryAssetId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['input', 'assetId'], message: 'Für bild- oder videobasierte Checks ist ein Asset erforderlich.' });
  }
});

export const assetDimensionsSchema = z.object({
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  durationSeconds: z.number().positive().optional(),
});

export const assetFlagsSchema = z.object({
  nsfw: z.boolean(),
  sensitive: z.boolean(),
  malwareScanned: z.boolean(),
  malwareDetected: z.boolean(),
});

export const assetRecordSchema = timestampedRecordSchema.merge(summaryRecordSchema).extend({
  id: uuidLikeSchema,
  assetType: assetTypeSchema,
  status: assetStatusSchema,
  originalFilename: optionalTrimmedStringSchema,
  mimeType: optionalTrimmedStringSchema,
  fileSizeBytes: z.number().int().nonnegative().optional(),
  sha256: optionalTrimmedStringSchema,
  dimensions: assetDimensionsSchema,
  storageKey: optionalTrimmedStringSchema,
  ownerUserId: optionalTrimmedStringSchema,
  flags: assetFlagsSchema,
  primaryCheckId: optionalTrimmedStringSchema,
  representationIds: z.array(z.string().min(1)),
  sourceIds: z.array(z.string().min(1)),
});

export const assetRepresentationRecordSchema = z.object({
  id: uuidLikeSchema,
  assetId: z.string().min(1),
  representationType: assetRepresentationTypeSchema,
  modelName: optionalTrimmedStringSchema,
  modelVersion: optionalTrimmedStringSchema,
  vectorReference: optionalTrimmedStringSchema,
  qualityScore: z.number().min(0).max(1).optional(),
  payload: unknownRecordSchema,
  createdAt: isoDateTimeSchema,
});

export const faceDetectionRecordSchema = z.object({
  id: uuidLikeSchema,
  assetId: z.string().min(1),
  keyframeAssetId: optionalTrimmedStringSchema,
  bbox: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  faceQualityScore: z.number().min(0).max(1).optional(),
  pose: z.record(z.string(), z.number()).optional(),
  occlusionScore: z.number().min(0).max(1).optional(),
  embeddingRepresentationId: optionalTrimmedStringSchema,
  createdAt: isoDateTimeSchema,
});

export const faceTrackRecordSchema = z.object({
  id: uuidLikeSchema,
  assetId: z.string().min(1),
  startSecond: z.number().min(0),
  endSecond: z.number().min(0),
  aggregatedQualityScore: z.number().min(0).max(1).optional(),
  representativeEmbeddingId: optionalTrimmedStringSchema,
  createdAt: isoDateTimeSchema,
}).superRefine((record, ctx) => {
  if (record.endSecond < record.startSecond) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endSecond'], message: 'endSecond darf nicht vor startSecond liegen.' });
  }
});

export const textArtifactRecordSchema = z.object({
  id: uuidLikeSchema,
  assetId: z.string().min(1),
  artifactType: textArtifactTypeSchema,
  languageCode: optionalTrimmedStringSchema,
  textContent: z.string().min(1),
  confidence: z.number().min(0).max(1).optional(),
  segmentReference: unknownRecordSchema.optional(),
  createdAt: isoDateTimeSchema,
});

export const sourceRecordSchema = timestampedRecordSchema.merge(summaryRecordSchema).extend({
  id: uuidLikeSchema,
  sourceType: sourceTypeSchema,
  sourceUrl: z.string().url(),
  sourceDomain: optionalTrimmedStringSchema,
  platformName: optionalTrimmedStringSchema,
  pageTitle: optionalTrimmedStringSchema,
  notes: optionalTrimmedStringSchema,
  validationStatus: sourceValidationStatusSchema,
  assetId: optionalTrimmedStringSchema,
  checkId: optionalTrimmedStringSchema,
  submittedByUserId: optionalTrimmedStringSchema,
}).superRefine((record, ctx) => {
  if (!record.assetId && !record.checkId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['assetId'], message: 'Quelle muss mindestens mit Asset oder Check verknüpft sein.' });
  }
});

export const contentMatchRecordSchema = timestampedRecordSchema.merge(summaryRecordSchema).extend({
  id: uuidLikeSchema,
  assetId: optionalTrimmedStringSchema,
  checkId: optionalTrimmedStringSchema,
  sourceId: optionalTrimmedStringSchema,
  providerId: optionalTrimmedStringSchema,
  matchType: matchTypeSchema,
  matchedUrl: z.string().url().optional(),
  platformName: optionalTrimmedStringSchema,
  firstSeenAt: isoDateTimeSchema.optional(),
  lastSeenAt: isoDateTimeSchema.optional(),
  confidence: z.number().min(0).max(1).optional(),
  knownFake: z.boolean(),
  knownLeak: z.boolean(),
  active: z.boolean(),
  reviewItemId: optionalTrimmedStringSchema,
  removalCaseId: optionalTrimmedStringSchema,
}).superRefine((record, ctx) => {
  if (!record.assetId && !record.checkId && !record.sourceId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['assetId'], message: 'Match muss auf Asset, Check oder Source referenzieren.' });
  }
});

export const workflowStepRecordSchema = z.object({
  id: uuidLikeSchema,
  workflowStepId: z.string().min(1),
  status: workflowStepStatusSchema,
  title: z.string().min(1),
  description: optionalTrimmedStringSchema,
  requiresConfirmation: z.boolean(),
  supportHandoverPossible: z.boolean(),
  notes: optionalTrimmedStringSchema,
  updatedAt: isoDateTimeSchema,
});

export const workflowRecordSchema = timestampedRecordSchema.extend({
  id: uuidLikeSchema,
  workflowId: z.string().min(1),
  checkId: optionalTrimmedStringSchema,
  status: workflowStatusSchema,
  currentStepIndex: z.number().int().nonnegative(),
  steps: z.array(workflowStepRecordSchema),
});

export const evidenceSourceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: evidenceSourceKindSchema,
  status: evidenceSourceStatusSchema,
});

export const evidenceSnapshotSchema = z.object({
  id: z.string().min(1),
  snapshotType: evidenceSnapshotTypeSchema,
  summary: z.string().min(1),
  coverage: evidenceCoverageSchema,
  retentionNote: z.string().min(1),
  capturedAt: isoDateTimeSchema,
  linkedAssetId: optionalTrimmedStringSchema,
  linkedCheckId: optionalTrimmedStringSchema,
  linkedMatchId: optionalTrimmedStringSchema,
  linkedReviewItemId: optionalTrimmedStringSchema,
  sources: z.array(evidenceSourceSchema),
  evidence: unknownRecordSchema,
});

export const reviewDecisionRecordSchema = z.object({
  id: uuidLikeSchema,
  reviewItemId: z.string().min(1),
  reviewerUserId: z.string().min(1),
  decisionType: reviewDecisionOutcomeSchema,
  rationale: z.string().min(1),
  evidenceSnapshotId: optionalTrimmedStringSchema,
  createdAt: isoDateTimeSchema,
});

export const reviewQueueItemSchema = timestampedRecordSchema.merge(summaryRecordSchema).extend({
  id: uuidLikeSchema,
  reviewType: reviewTypeSchema,
  priority: reviewPrioritySchema,
  status: reviewStatusSchema,
  linkedCheckId: optionalTrimmedStringSchema,
  linkedAssetId: optionalTrimmedStringSchema,
  linkedMatchId: optionalTrimmedStringSchema,
  linkedRemovalCaseId: optionalTrimmedStringSchema,
  linkedSupportRequestId: optionalTrimmedStringSchema,
  assignedTo: optionalTrimmedStringSchema,
  recommendedAction: recommendedActionSchema,
  finalDecision: reviewDecisionOutcomeSchema.optional(),
  reviewerNotes: optionalTrimmedStringSchema,
  evidenceSnapshot: evidenceSnapshotSchema,
}).superRefine((item, ctx) => {
  if (!item.linkedCheckId && !item.linkedAssetId && !item.linkedMatchId && !item.linkedRemovalCaseId && !item.linkedSupportRequestId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['linkedCheckId'], message: 'Review-Item benötigt mindestens eine fachliche Verknüpfung.' });
  }

  if (item.status === 'decided' && !item.finalDecision) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['finalDecision'], message: 'Entschiedene Reviews benötigen ein Final Decision Outcome.' });
  }
});

export const removalActionRecordSchema = z.object({
  id: uuidLikeSchema,
  actionType: removalActionTypeSchema,
  recipient: optionalTrimmedStringSchema,
  payloadSummary: optionalTrimmedStringSchema,
  resultStatus: optionalTrimmedStringSchema,
  externalTicketId: optionalTrimmedStringSchema,
  createdAt: isoDateTimeSchema,
});

export const removalCaseRecordSchema = timestampedRecordSchema.merge(summaryRecordSchema).extend({
  id: uuidLikeSchema,
  caseType: removalCaseTypeSchema,
  platform: z.string().min(1),
  targetUrl: z.string().url(),
  legalBasis: optionalTrimmedStringSchema,
  status: removalStatusSchema,
  severity: severitySchema,
  evidenceCoverage: evidenceCoverageSchema,
  slaRisk: slaRiskSchema,
  reviewStatus: reviewStatusSchema,
  supportRequested: z.boolean(),
  assignedTo: optionalTrimmedStringSchema,
  linkedAssetId: optionalTrimmedStringSchema,
  linkedMatchId: optionalTrimmedStringSchema,
  linkedCheckId: optionalTrimmedStringSchema,
  nextActionLabel: z.string().min(1),
  evidenceSnapshot: evidenceSnapshotSchema,
  actions: z.array(removalActionRecordSchema),
  lastUpdateAt: isoDateTimeSchema,
}).superRefine((record, ctx) => {
  if ((record.status === 'submitted' || record.status === 'under_review') && record.actions.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['actions'], message: 'Submitted/under_review Removal Cases benötigen mindestens eine dokumentierte Action.' });
  }
});

export const supportRequestRecordSchema = timestampedRecordSchema.extend({
  id: uuidLikeSchema,
  requestType: supportRequestTypeSchema,
  priority: reviewPrioritySchema,
  status: supportStatusSchema,
  preferredContact: optionalTrimmedStringSchema,
  message: z.string().trim().min(1),
  checkId: optionalTrimmedStringSchema,
  assetId: optionalTrimmedStringSchema,
  removalCaseId: optionalTrimmedStringSchema,
  assignedTo: optionalTrimmedStringSchema,
  assignmentHistory: z.array(z.object({
    assignedTo: optionalTrimmedStringSchema,
    assignedBy: optionalTrimmedStringSchema,
    reason: optionalTrimmedStringSchema,
    changedAt: isoDateTimeSchema,
  })),
  statusHistory: z.array(z.object({
    fromStatus: supportStatusSchema.optional(),
    toStatus: supportStatusSchema,
    changedBy: optionalTrimmedStringSchema,
    reason: optionalTrimmedStringSchema,
    changedAt: isoDateTimeSchema,
  })),
  audit: z.object({
    createdBy: optionalTrimmedStringSchema,
    lastModifiedBy: optionalTrimmedStringSchema,
    lastAction: optionalTrimmedStringSchema,
  }),
  retention: z.object({
    policyKey: z.string().trim().min(1),
    retainUntil: isoDateTimeSchema,
    lastReviewedAt: isoDateTimeSchema,
  }),
}).superRefine((record, ctx) => {
  if (!record.checkId && !record.assetId && !record.removalCaseId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['checkId'], message: 'Support-Anfrage sollte mit Check, Asset oder Removal Case verknüpft sein.' });
  }
});

export const supportQueueItemSchema = z.object({
  id: uuidLikeSchema,
  requesterLabel: z.string().min(1),
  priority: reviewPrioritySchema,
  requestType: supportRequestTypeSchema,
  status: supportStatusSchema,
  assignedTo: optionalTrimmedStringSchema,
  slaRisk: slaRiskSchema,
  slaDueAt: optionalTrimmedStringSchema,
  updatedAt: isoDateTimeSchema,
  note: z.string().min(1),
  linkedReviewItemId: optionalTrimmedStringSchema,
  linkedRemovalCaseId: optionalTrimmedStringSchema,
  evidenceCoverage: evidenceCoverageSchema,
});

export const providerRecordSchema = timestampedRecordSchema.merge(summaryRecordSchema).extend({
  id: uuidLikeSchema,
  slug: z.string().min(1),
  displayName: z.string().min(1),
  category: providerCategorySchema,
  status: providerStatusSchema,
  capabilities: z.array(providerCapabilitySchema),
  supportedSourceTypes: z.array(sourceTypeSchema),
  supportsAsyncJobs: z.boolean(),
  rateLimitPerMinute: z.number().int().positive().optional(),
  baseUrl: z.string().url().optional(),
  documentationUrl: z.string().url().optional(),
  retentionHint: optionalTrimmedStringSchema,
});

export const searchCandidateSchema = z.object({
  id: uuidLikeSchema,
  candidateUrl: z.string().url(),
  candidateSource: z.string().min(1),
  candidateType: searchCandidateTypeSchema,
  retrievalMethod: searchRetrievalMethodSchema,
  rawScore: z.number(),
  rerankedScore: z.number(),
  rankPosition: z.number().int().nonnegative(),
  promotedToMatch: z.boolean(),
  relatedMatchId: optionalTrimmedStringSchema,
});

export const unifiedSearchRecordSchema = timestampedRecordSchema.merge(summaryRecordSchema).extend({
  id: uuidLikeSchema,
  title: z.string().min(1),
  platform: z.string().min(1),
  queryType: searchQueryTypeSchema,
  searchStatus: searchExecutionStatusSchema,
  reviewPriority: reviewPrioritySchema,
  reviewStatus: reviewStatusSchema,
  removalStatus: removalStatusSchema,
  supportStatus: supportStatusSchema,
  evidenceCoverage: evidenceCoverageSchema,
  severity: severitySchema,
  slaRisk: slaRiskSchema,
  assignedTo: optionalTrimmedStringSchema,
  nextActionLabel: z.string().min(1),
  evidenceSnapshot: evidenceSnapshotSchema,
  linkedCheckId: optionalTrimmedStringSchema,
  linkedAssetId: optionalTrimmedStringSchema,
  linkedRemovalCaseId: optionalTrimmedStringSchema,
  linkedSupportRequestId: optionalTrimmedStringSchema,
  candidates: z.array(searchCandidateSchema),
});

export const createCheckRequestSchema = z.object({
  type: checkTypeSchema,
  input: checkInputSchema,
}).superRefine((value, ctx) => {
  const parsed = checkRecordSchema.safeParse({
    id: 'draft',
    type: value.type,
    status: 'pending',
    input: value.input,
    risk: { flaggedSignals: [] },
    submittedSourceIds: value.input.submittedSourceIds ?? [],
    reviewItemIds: [],
    removalCaseIds: [],
    createdAt: '2026-01-01T00:00:00+00:00',
    updatedAt: '2026-01-01T00:00:00+00:00',
  });

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === 'id' || issue.path[0] === 'status' || issue.path[0] === 'risk' || issue.path[0] === 'reviewItemIds' || issue.path[0] === 'removalCaseIds' || issue.path[0] === 'createdAt' || issue.path[0] === 'updatedAt' || issue.path[0] === 'submittedSourceIds') {
        continue;
      }

      ctx.addIssue(issue);
    }
  }
});

export const createSourceRequestSchema = z.object({
  sourceType: sourceTypeSchema,
  sourceUrl: z.string().url(),
  platformName: optionalTrimmedStringSchema,
  pageTitle: optionalTrimmedStringSchema,
  notes: optionalTrimmedStringSchema,
  assetId: optionalTrimmedStringSchema,
  checkId: optionalTrimmedStringSchema,
}).superRefine((value, ctx) => {
  if (!value.assetId && !value.checkId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['assetId'], message: 'Quelle benötigt assetId oder checkId.' });
  }
});

export const createAssetUploadIntentRequestSchema = z.object({
  assetType: assetTypeSchema,
  originalFilename: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  fileSizeBytes: z.number().int().positive(),
  sha256: optionalTrimmedStringSchema,
  primaryCheckId: optionalTrimmedStringSchema,
}).superRefine((value, ctx) => {
  const acceptedMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
  ]);

  if (!acceptedMimeTypes.has(value.mimeType)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['mimeType'], message: 'Nicht unterstützter MIME-Type.' });
  }

  const maxSizeBytes = value.assetType === 'video'
    ? 250 * 1024 * 1024
    : value.assetType === 'image'
      ? 25 * 1024 * 1024
      : 15 * 1024 * 1024;

  if (value.fileSizeBytes > maxSizeBytes) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fileSizeBytes'], message: 'Datei überschreitet das zulässige Größenlimit.' });
  }
});

export const completeAssetUploadRequestSchema = z.object({
  uploadedSizeBytes: z.number().int().positive().optional(),
  sha256: optionalTrimmedStringSchema,
  mimeType: optionalTrimmedStringSchema,
});

export const finalizeAssetSecurityRequestSchema = z.object({
  mimeTypeVerified: z.boolean(),
  malwareDetected: z.boolean(),
});

export const createSupportRequestSchema = z.object({
  requestType: supportRequestTypeSchema,
  priority: reviewPrioritySchema.default('medium'),
  checkId: optionalTrimmedStringSchema,
  assetId: optionalTrimmedStringSchema,
  removalCaseId: optionalTrimmedStringSchema,
  preferredContact: optionalTrimmedStringSchema,
  message: z.string().trim().min(1),
}).superRefine((value, ctx) => {
  if (!value.checkId && !value.assetId && !value.removalCaseId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['checkId'], message: 'Support-Anfrage benötigt checkId, assetId oder removalCaseId.' });
  }
});

export const updateSupportRequestAssignmentSchema = z.object({
  assignedTo: optionalTrimmedStringSchema,
  assignedBy: optionalTrimmedStringSchema,
  reason: optionalTrimmedStringSchema,
});

export const transitionSupportRequestStatusSchema = z.object({
  status: supportStatusSchema,
  changedBy: optionalTrimmedStringSchema,
  reason: optionalTrimmedStringSchema,
});

export const intakeOrchestratorSchema = z.object({
  concern: z.string().trim().min(1),
  payload: z.object({
    check: createCheckRequestSchema,
    source: createSourceRequestSchema,
    support: createSupportRequestSchema,
  }),
});

export type CreateCheckRequest = z.infer<typeof createCheckRequestSchema>;
export type CreateSourceRequest = z.infer<typeof createSourceRequestSchema>;
export type CreateAssetUploadIntentRequest = z.infer<typeof createAssetUploadIntentRequestSchema>;
export type CompleteAssetUploadRequest = z.infer<typeof completeAssetUploadRequestSchema>;
export type FinalizeAssetSecurityRequest = z.infer<typeof finalizeAssetSecurityRequestSchema>;
export type CreateSupportRequest = z.infer<typeof createSupportRequestSchema>;
export type UpdateSupportRequestAssignment = z.infer<typeof updateSupportRequestAssignmentSchema>;
export type TransitionSupportRequestStatus = z.infer<typeof transitionSupportRequestStatusSchema>;
export type IntakeOrchestratorRequest = z.infer<typeof intakeOrchestratorSchema>;

export type ContractValidationIssue = {
  path: string;
  message: string;
};

export type ContractValidationResult<T> =
  | { success: true; data: T; issues: [] }
  | { success: false; data?: undefined; issues: ContractValidationIssue[] };

const contractErrorMessages = {
  sourceAnchorRequired: 'Quelle benötigt assetId oder checkId.',
  supportRoutingRequired: 'Support-Anfrage benötigt checkId, assetId oder removalCaseId.',
} as const;

function formatIssuePath(path: (string | number)[]) {
  return path.reduce<string>((accumulator, segment) => {
    if (typeof segment === 'number') {
      return `${accumulator}[${segment}]`;
    }

    return accumulator ? `${accumulator}.${segment}` : segment;
  }, '');
}

function mapIssues(issues: z.ZodIssue[]): ContractValidationIssue[] {
  return issues.map((issue) => ({
    path: formatIssuePath(issue.path),
    message: issue.message,
  }));
}

function dedupeIssues(issues: ContractValidationIssue[]) {
  const seen = new Set<string>();

  return issues.filter((issue) => {
    const key = `${issue.path}:${issue.message}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function normalizeCreateDraftIssues(issues: ContractValidationIssue[]) {
  const normalized = issues.map((issue) => {
    if ((issue.path === 'assetId' || issue.path === 'checkId' || issue.path === 'removalCaseId') && issue.message === 'String must contain at least 1 character(s)') {
      return {
        ...issue,
        message: 'Darf nicht leer sein.',
      };
    }

    return issue;
  });

  const hasSourceAnchorError = normalized.some((issue) => issue.message === contractErrorMessages.sourceAnchorRequired);
  const hasSupportRoutingError = normalized.some((issue) => issue.message === contractErrorMessages.supportRoutingRequired);

  return dedupeIssues(
    normalized.filter((issue) => {
      if (hasSourceAnchorError && (issue.path === 'assetId' || issue.path === 'checkId') && issue.message === 'Darf nicht leer sein.') {
        return false;
      }

      if (hasSupportRoutingError && (issue.path === 'checkId' || issue.path === 'assetId' || issue.path === 'removalCaseId') && issue.message === 'Darf nicht leer sein.') {
        return false;
      }

      return true;
    }),
  );
}

export function safeParseCreateCheckRequest(input: unknown): ContractValidationResult<CreateCheckRequest> {
  const parsed = createCheckRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      issues: normalizeCreateDraftIssues(mapIssues(parsed.error.issues)),
    };
  }

  return {
    success: true,
    data: parsed.data,
    issues: [],
  };
}

export function safeParseCreateSourceRequest(input: unknown): ContractValidationResult<CreateSourceRequest> {
  const parsed = createSourceRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      issues: normalizeCreateDraftIssues(mapIssues(parsed.error.issues)),
    };
  }

  return {
    success: true,
    data: parsed.data,
    issues: [],
  };
}

export function safeParseCreateAssetUploadIntentRequest(input: unknown): ContractValidationResult<CreateAssetUploadIntentRequest> {
  const parsed = createAssetUploadIntentRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      issues: normalizeCreateDraftIssues(mapIssues(parsed.error.issues)),
    };
  }

  return {
    success: true,
    data: parsed.data,
    issues: [],
  };
}

export function safeParseCompleteAssetUploadRequest(input: unknown): ContractValidationResult<CompleteAssetUploadRequest> {
  const parsed = completeAssetUploadRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      issues: normalizeCreateDraftIssues(mapIssues(parsed.error.issues)),
    };
  }

  return {
    success: true,
    data: parsed.data,
    issues: [],
  };
}

export function safeParseFinalizeAssetSecurityRequest(input: unknown): ContractValidationResult<FinalizeAssetSecurityRequest> {
  const parsed = finalizeAssetSecurityRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      issues: normalizeCreateDraftIssues(mapIssues(parsed.error.issues)),
    };
  }

  return {
    success: true,
    data: parsed.data,
    issues: [],
  };
}

export function safeParseCreateSupportRequest(input: unknown): ContractValidationResult<CreateSupportRequest> {
  const parsed = createSupportRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      issues: normalizeCreateDraftIssues(mapIssues(parsed.error.issues)),
    };
  }

  return {
    success: true,
    data: parsed.data,
    issues: [],
  };
}

export function safeParseUpdateSupportRequestAssignment(input: unknown): ContractValidationResult<UpdateSupportRequestAssignment> {
  const parsed = updateSupportRequestAssignmentSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: parsed.error.issues.map((issue) => ({ path: formatIssuePath(issue.path), message: issue.message })),
  };
}

export function safeParseTransitionSupportRequestStatus(input: unknown): ContractValidationResult<TransitionSupportRequestStatus> {
  const parsed = transitionSupportRequestStatusSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: parsed.error.issues.map((issue) => ({ path: formatIssuePath(issue.path), message: issue.message })),
  };
}

export function safeParseIntakeOrchestrator(input: unknown): ContractValidationResult<IntakeOrchestratorRequest> {
  const parsed = intakeOrchestratorSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: parsed.error.issues.map((issue) => ({ path: formatIssuePath(issue.path), message: issue.message })),
  };
}

export function parseCheckRecord(input: unknown) { return checkRecordSchema.parse(input); }
export function parseAssetRecord(input: unknown) { return assetRecordSchema.parse(input); }
export function parseAssetRepresentationRecord(input: unknown) { return assetRepresentationRecordSchema.parse(input); }
export function parseFaceDetectionRecord(input: unknown) { return faceDetectionRecordSchema.parse(input); }
export function parseFaceTrackRecord(input: unknown) { return faceTrackRecordSchema.parse(input); }
export function parseTextArtifactRecord(input: unknown) { return textArtifactRecordSchema.parse(input); }
export function parseSourceRecord(input: unknown) { return sourceRecordSchema.parse(input); }
export function parseContentMatchRecord(input: unknown) { return contentMatchRecordSchema.parse(input); }
export function parseWorkflowRecord(input: unknown) { return workflowRecordSchema.parse(input); }
export function parseReviewDecisionRecord(input: unknown) { return reviewDecisionRecordSchema.parse(input); }
export function parseReviewQueueItem(input: unknown) { return reviewQueueItemSchema.parse(input); }
export function parseRemovalCaseRecord(input: unknown) { return removalCaseRecordSchema.parse(input); }
export function parseSupportRequestRecord(input: unknown) { return supportRequestRecordSchema.parse(input); }
export function parseSupportQueueItem(input: unknown) { return supportQueueItemSchema.parse(input); }
export function parseProviderRecord(input: unknown) { return providerRecordSchema.parse(input); }
export function parseUnifiedSearchRecord(input: unknown) { return unifiedSearchRecordSchema.parse(input); }

export function parseSupportQueueItems(input: unknown) { return z.array(supportQueueItemSchema).parse(input); }
export function parseRemovalCaseRecords(input: unknown) { return z.array(removalCaseRecordSchema).parse(input); }
export function parseReviewQueueItems(input: unknown) { return z.array(reviewQueueItemSchema).parse(input); }
export function parseUnifiedSearchRecords(input: unknown) { return z.array(unifiedSearchRecordSchema).parse(input); }
export function parseReviewQueueFilterState(input: unknown) { return reviewQueueFilterStateSchema.parse(input); }
export function parseRemovalFilterState(input: unknown) { return removalFilterStateSchema.parse(input); }
export function parseSupportQueueFilterState(input: unknown) { return supportQueueFilterStateSchema.parse(input); }
export function parseSearchFilterState(input: unknown) { return searchFilterStateSchema.parse(input); }
export function parseCreateCheckRequest(input: unknown) { return createCheckRequestSchema.parse(input); }
export function parseCreateSourceRequest(input: unknown) { return createSourceRequestSchema.parse(input); }
export function parseCreateAssetUploadIntentRequest(input: unknown) { return createAssetUploadIntentRequestSchema.parse(input); }
export function parseCompleteAssetUploadRequest(input: unknown) { return completeAssetUploadRequestSchema.parse(input); }
export function parseFinalizeAssetSecurityRequest(input: unknown) { return finalizeAssetSecurityRequestSchema.parse(input); }
export function parseCreateSupportRequest(input: unknown) { return createSupportRequestSchema.parse(input); }
export function parseUpdateSupportRequestAssignment(input: unknown) { return updateSupportRequestAssignmentSchema.parse(input); }
export function parseTransitionSupportRequestStatus(input: unknown) { return transitionSupportRequestStatusSchema.parse(input); }
export function parseIntakeOrchestratorRequest(input: unknown) { return intakeOrchestratorSchema.parse(input); }

export const apiActorRoleSchema = z.enum(['anonymous', 'user', 'support_agent', 'reviewer', 'admin', 'service']);
export const apiPermissionSchema = z.enum([
  'assets:create',
  'assets:read',
  'assets:update',
  'checks:create',
  'checks:read',
  'jobs:read',
  'sources:create',
  'sources:read',
  'support_requests:create',
  'support_requests:read',
  'support_requests:assign',
  'support_requests:transition',
  'removal_cases:create',
  'removal_cases:read',
  'removal_cases:update',
  'reviews:read',
  'reviews:update',
]);
export const apiScopeTokenSchema = z.union([apiPermissionSchema, z.literal('*')]);

export const authClaimsSchema = z.object({
  subject: optionalTrimmedStringSchema,
  role: apiActorRoleSchema.default('anonymous'),
  scopes: z.array(apiScopeTokenSchema).default([]),
  tenantId: optionalTrimmedStringSchema,
});

export const registerRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  fullName: optionalTrimmedStringSchema,
});

export const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const refreshRequestSchema = z.object({
  refreshToken: z.string().trim().min(1),
});

export const authUserSchema = z.object({
  id: uuidLikeSchema,
  email: z.string().trim().email(),
  role: z.enum(['user', 'support_agent', 'reviewer', 'admin']),
  fullName: optionalTrimmedStringSchema,
});

export const authResponseSchema = z.object({
  user: authUserSchema,
  token: z.string().trim().min(1),
  refreshToken: z.string().trim().min(1),
});

export const updateUserProfileRequestSchema = z.object({
  fullName: optionalTrimmedStringSchema,
  locale: optionalTrimmedStringSchema,
  timezone: optionalTrimmedStringSchema,
  preferredContact: optionalTrimmedStringSchema,
});

export const apiRequestContextSchema = z.object({
  requestId: uuidLikeSchema,
  apiVersion: z.literal('v1'),
  actor: authClaimsSchema,
});

export const workerQueueNameSchema = z.enum(['assets', 'checks', 'reviews', 'support', 'removals', 'retention']);
export const workerJobNameSchema = z.enum([
  'asset.scan',
  'asset.promote',
  'check.execute',
  'review.materialize',
  'support.triage',
  'removal.submit',
  'removal.sync_status',
  'retention.cleanup',
]);

export const assetScanJobPayloadSchema = z.object({
  assetId: uuidLikeSchema,
  assetType: assetTypeSchema,
  mimeType: optionalTrimmedStringSchema,
  quarantineStorageKey: z.string().trim().min(1),
  requestedBy: optionalTrimmedStringSchema,
});

export const assetPromoteJobPayloadSchema = z.object({
  assetId: uuidLikeSchema,
  quarantineStorageKey: z.string().trim().min(1),
  requestedBy: optionalTrimmedStringSchema,
});

export const checkExecutionJobPayloadSchema = z.object({
  checkId: uuidLikeSchema,
  checkType: checkTypeSchema,
  submittedSourceIds: z.array(z.string().min(1)).default([]),
  requestedBy: optionalTrimmedStringSchema,
});

export const reviewMaterializeJobPayloadSchema = z.object({
  reviewItemId: uuidLikeSchema,
  checkId: uuidLikeSchema,
  priority: reviewPrioritySchema,
  requestedBy: optionalTrimmedStringSchema,
});

export const supportTriageJobPayloadSchema = z.object({
  supportRequestId: uuidLikeSchema,
  priority: reviewPrioritySchema,
  checkId: optionalTrimmedStringSchema,
  requestedBy: optionalTrimmedStringSchema,
});

export const removalSubmitJobPayloadSchema = z.object({
  removalCaseId: uuidLikeSchema,
  platform: z.string().trim().min(1),
  targetUrl: z.string().url(),
  requestedBy: optionalTrimmedStringSchema,
});

export const removalSyncStatusJobPayloadSchema = z.object({
  removalCaseId: uuidLikeSchema,
  externalTicketId: optionalTrimmedStringSchema,
  requestedBy: optionalTrimmedStringSchema,
});

export const retentionCleanupJobPayloadSchema = z.object({
  runAt: isoDateTimeSchema,
  policyScope: z.enum(['all', 'support_requests', 'checks', 'sources', 'reviews', 'evidence', 'jobs']).default('all'),
  requestedBy: optionalTrimmedStringSchema,
});

const bullmqJobBaseSchema = z.object({
  jobId: uuidLikeSchema,
  traceId: uuidLikeSchema,
  dedupeKey: optionalTrimmedStringSchema,
  attempts: z.number().int().positive().default(1),
  requestedBy: authClaimsSchema,
  enqueuedAt: isoDateTimeSchema,
});

export const bullmqJobEnvelopeSchema = z.discriminatedUnion('name', [
  bullmqJobBaseSchema.extend({
    queue: z.literal('assets'),
    name: z.literal('asset.scan'),
    payload: assetScanJobPayloadSchema,
  }),
  bullmqJobBaseSchema.extend({
    queue: z.literal('assets'),
    name: z.literal('asset.promote'),
    payload: assetPromoteJobPayloadSchema,
  }),
  bullmqJobBaseSchema.extend({
    queue: z.literal('checks'),
    name: z.literal('check.execute'),
    payload: checkExecutionJobPayloadSchema,
  }),
  bullmqJobBaseSchema.extend({
    queue: z.literal('reviews'),
    name: z.literal('review.materialize'),
    payload: reviewMaterializeJobPayloadSchema,
  }),
  bullmqJobBaseSchema.extend({
    queue: z.literal('support'),
    name: z.literal('support.triage'),
    payload: supportTriageJobPayloadSchema,
  }),
  bullmqJobBaseSchema.extend({
    queue: z.literal('removals'),
    name: z.literal('removal.submit'),
    payload: removalSubmitJobPayloadSchema,
  }),
  bullmqJobBaseSchema.extend({
    queue: z.literal('removals'),
    name: z.literal('removal.sync_status'),
    payload: removalSyncStatusJobPayloadSchema,
  }),
  bullmqJobBaseSchema.extend({
    queue: z.literal('retention'),
    name: z.literal('retention.cleanup'),
    payload: retentionCleanupJobPayloadSchema,
  }),
]);

export type ApiActorRole = z.infer<typeof apiActorRoleSchema>;
export type ApiPermission = z.infer<typeof apiPermissionSchema>;
export type ApiScopeToken = z.infer<typeof apiScopeTokenSchema>;
export type AuthClaims = z.infer<typeof authClaimsSchema>;
export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type UpdateUserProfileRequest = z.infer<typeof updateUserProfileRequestSchema>;
export type ApiRequestContext = z.infer<typeof apiRequestContextSchema>;
export type WorkerQueueName = z.infer<typeof workerQueueNameSchema>;
export type WorkerJobName = z.infer<typeof workerJobNameSchema>;
export type AssetScanJobPayload = z.infer<typeof assetScanJobPayloadSchema>;
export type AssetPromoteJobPayload = z.infer<typeof assetPromoteJobPayloadSchema>;
export type CheckExecutionJobPayload = z.infer<typeof checkExecutionJobPayloadSchema>;
export type ReviewMaterializeJobPayload = z.infer<typeof reviewMaterializeJobPayloadSchema>;
export type SupportTriageJobPayload = z.infer<typeof supportTriageJobPayloadSchema>;
export type RemovalSubmitJobPayload = z.infer<typeof removalSubmitJobPayloadSchema>;
export type RemovalSyncStatusJobPayload = z.infer<typeof removalSyncStatusJobPayloadSchema>;
export type RetentionCleanupJobPayload = z.infer<typeof retentionCleanupJobPayloadSchema>;
export type BullmqJobEnvelope = z.infer<typeof bullmqJobEnvelopeSchema>;

export function safeParseAuthClaims(input: unknown): ContractValidationResult<AuthClaims> {
  const parsed = authClaimsSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: mapIssues(parsed.error.issues),
  };
}

export function safeParseRegisterRequest(input: unknown): ContractValidationResult<RegisterRequest> {
  const parsed = registerRequestSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: mapIssues(parsed.error.issues),
  };
}

export function safeParseLoginRequest(input: unknown): ContractValidationResult<LoginRequest> {
  const parsed = loginRequestSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: mapIssues(parsed.error.issues),
  };
}

export function safeParseRefreshRequest(input: unknown): ContractValidationResult<RefreshRequest> {
  const parsed = refreshRequestSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: mapIssues(parsed.error.issues),
  };
}

export function safeParseUpdateUserProfileRequest(input: unknown): ContractValidationResult<UpdateUserProfileRequest> {
  const parsed = updateUserProfileRequestSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: mapIssues(parsed.error.issues),
  };
}

export function safeParseApiRequestContext(input: unknown): ContractValidationResult<ApiRequestContext> {
  const parsed = apiRequestContextSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: mapIssues(parsed.error.issues),
  };
}

export function safeParseBullmqJobEnvelope(input: unknown): ContractValidationResult<BullmqJobEnvelope> {
  const parsed = bullmqJobEnvelopeSchema.safeParse(input);

  if (parsed.success) {
    return { success: true, data: parsed.data, issues: [] };
  }

  return {
    success: false,
    issues: mapIssues(parsed.error.issues),
  };
}
