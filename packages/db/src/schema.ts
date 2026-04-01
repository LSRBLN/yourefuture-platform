import { sql } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

const defaultEmptyJsonArray = sql`'[]'::jsonb`;
const defaultEmptyJsonObject = sql`'{}'::jsonb`;

const timestampColumns = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const checkTypeEnum = pgEnum('check_type', [
  'leak_email',
  'leak_username',
  'leak_phone',
  'leak_domain',
  'password_hash',
  'image',
  'video',
  'source_only',
]);

export const checkStatusEnum = pgEnum('check_status', [
  'pending',
  'queued',
  'running',
  'completed',
  'partial_failure',
  'failed',
  'cancelled',
]);

export const sourceTypeEnum = pgEnum('source_type', [
  'profile_url',
  'listing_url',
  'image_url',
  'video_url',
  'document_url',
  'social_post_url',
  'other_url',
]);

export const sourceValidationStatusEnum = pgEnum('source_validation_status', [
  'pending',
  'validated',
  'invalid',
  'rejected',
]);
export const assetTypeEnum = pgEnum('asset_type', ['image', 'video', 'document', 'other']);
export const assetStatusEnum = pgEnum('asset_status', ['pending_upload', 'uploaded', 'scanning', 'ready', 'flagged', 'failed']);

export const reviewPriorityEnum = pgEnum('review_priority', ['low', 'medium', 'high', 'urgent']);
export const supportRequestTypeEnum = pgEnum('support_request_type', ['support', 'removal', 'upload_review', 'identity_review']);
export const supportStatusEnum = pgEnum('support_status', ['open', 'triaged', 'assigned', 'in_progress', 'waiting_user', 'escalated', 'resolved', 'closed']);
export const removalCaseTypeEnum = pgEnum('removal_case_type', ['privacy_removal', 'non_consensual_intimate_content', 'impersonation', 'defamation', 'copyright', 'other']);
export const removalStatusEnum = pgEnum('removal_status', [
  'open',
  'preparing',
  'submitted',
  'under_review',
  'followup_required',
  'escalated',
  'removed',
  'partially_removed',
  'rejected',
  'closed',
]);
export const reviewTypeEnum = pgEnum('review_type', ['analyst', 'support_escalation', 'removal_review']);
export const reviewStatusEnum = pgEnum('review_status', ['open', 'triaged', 'assigned', 'in_review', 'waiting_more_context', 'decided', 'escalated', 'closed']);
export const jobStatusEnum = pgEnum('job_status', ['queued', 'running', 'completed', 'failed']);
export const reviewDecisionOutcomeEnum = pgEnum('review_decision_outcome', [
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
export const recommendedActionEnum = pgEnum('recommended_action', [
  'monitor',
  'rerun_analysis',
  'request_more_context',
  'handover_support',
  'recommend_removal',
  'legal_escalation',
]);
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);
export const evidenceCoverageEnum = pgEnum('evidence_coverage', ['complete', 'partial', 'missing']);
export const slaRiskEnum = pgEnum('sla_risk', ['healthy', 'watch', 'risk', 'breach']);
export const evidenceSnapshotTypeEnum = pgEnum('evidence_snapshot_type', ['search_result', 'review_brief', 'provider_packet']);
export const evidenceSourceKindEnum = pgEnum('evidence_source_kind', ['url', 'screenshot', 'document', 'audit_log']);
export const evidenceSourceStatusEnum = pgEnum('evidence_source_status', ['verified', 'pending', 'missing']);

export const checksTable = pgTable(
  'checks',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id'),
    type: checkTypeEnum('type').notNull(),
    status: checkStatusEnum('status').notNull().default('queued'),
    summary: text('summary'),
    input: jsonb('input').$type<Record<string, unknown>>().notNull(),
    risk: jsonb('risk').$type<Record<string, unknown>>().notNull().default(defaultEmptyJsonObject),
    submittedSourceIds: jsonb('submitted_source_ids').$type<string[]>().notNull().default(defaultEmptyJsonArray),
    primaryAssetId: text('primary_asset_id'),
    workflowInstanceId: text('workflow_instance_id'),
    supportRequestId: text('support_request_id'),
    reviewItemIds: jsonb('review_item_ids').$type<string[]>().notNull().default(defaultEmptyJsonArray),
    removalCaseIds: jsonb('removal_case_ids').$type<string[]>().notNull().default(defaultEmptyJsonArray),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('checks_owner_user_idx').on(table.ownerUserId),
    typeIdx: index('checks_type_idx').on(table.type),
    statusIdx: index('checks_status_idx').on(table.status),
    supportRequestIdx: index('checks_support_request_idx').on(table.supportRequestId),
  }),
);

export const sourcesTable = pgTable(
  'sources',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id'),
    checkId: text('check_id').references(() => checksTable.id, { onDelete: 'set null' }),
    assetId: text('asset_id'),
    sourceType: sourceTypeEnum('source_type').notNull(),
    sourceUrl: text('source_url').notNull(),
    platformName: text('platform_name'),
    pageTitle: text('page_title'),
    notes: text('notes'),
    validationStatus: sourceValidationStatusEnum('validation_status').notNull().default('pending'),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('sources_owner_user_idx').on(table.ownerUserId),
    checkIdx: index('sources_check_idx').on(table.checkId),
    assetIdx: index('sources_asset_idx').on(table.assetId),
    sourceUrlIdx: index('sources_source_url_idx').on(table.sourceUrl),
  }),
);

export const supportRequestsTable = pgTable(
  'support_requests',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id'),
    checkId: text('check_id').references(() => checksTable.id, { onDelete: 'set null' }),
    assetId: text('asset_id'),
    removalCaseId: text('removal_case_id'),
    requestType: supportRequestTypeEnum('request_type').notNull(),
    priority: reviewPriorityEnum('priority').notNull().default('medium'),
    status: supportStatusEnum('status').notNull().default('open'),
    preferredContact: text('preferred_contact'),
    message: text('message').notNull(),
    assignedTo: text('assigned_to'),
    assignmentHistory: jsonb('assignment_history').$type<Record<string, unknown>[]>().notNull().default(defaultEmptyJsonArray),
    statusHistory: jsonb('status_history').$type<Record<string, unknown>[]>().notNull().default(defaultEmptyJsonArray),
    audit: jsonb('audit').$type<Record<string, unknown>>().notNull().default(defaultEmptyJsonObject),
    retention: jsonb('retention').$type<Record<string, unknown>>().notNull().default(defaultEmptyJsonObject),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('support_requests_owner_user_idx').on(table.ownerUserId),
    checkIdx: index('support_requests_check_idx').on(table.checkId),
    removalCaseIdx: index('support_requests_removal_case_idx').on(table.removalCaseId),
    statusIdx: index('support_requests_status_idx').on(table.status),
    assignedToIdx: index('support_requests_assigned_to_idx').on(table.assignedTo),
  }),
);

export const assetsTable = pgTable(
  'assets',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id'),
    primaryCheckId: text('primary_check_id').references(() => checksTable.id, { onDelete: 'set null' }),
    assetType: assetTypeEnum('asset_type').notNull(),
    status: assetStatusEnum('status').notNull().default('pending_upload'),
    summary: text('summary'),
    originalFilename: text('original_filename'),
    mimeType: text('mime_type'),
    fileSizeBytes: integer('file_size_bytes'),
    sha256: text('sha256'),
    dimensions: jsonb('dimensions').$type<Record<string, unknown>>().notNull().default(defaultEmptyJsonObject),
    storageKey: text('storage_key'),
    quarantineStorageKey: text('quarantine_storage_key'),
    flags: jsonb('flags').$type<Record<string, unknown>>().notNull().default(sql`'{"nsfw":false,"sensitive":true,"malwareScanned":false,"malwareDetected":false}'::jsonb`),
    representationIds: jsonb('representation_ids').$type<string[]>().notNull().default(defaultEmptyJsonArray),
    sourceIds: jsonb('source_ids').$type<string[]>().notNull().default(defaultEmptyJsonArray),
    uploadCompletedAt: timestamp('upload_completed_at', { withTimezone: true }),
    scannedAt: timestamp('scanned_at', { withTimezone: true }),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('assets_owner_user_idx').on(table.ownerUserId),
    primaryCheckIdx: index('assets_primary_check_idx').on(table.primaryCheckId),
    statusIdx: index('assets_status_idx').on(table.status),
    assetTypeIdx: index('assets_asset_type_idx').on(table.assetType),
    shaIdx: index('assets_sha256_idx').on(table.sha256),
  }),
);

export const removalCasesTable = pgTable(
  'removal_cases',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id'),
    linkedCheckId: text('linked_check_id').references(() => checksTable.id, { onDelete: 'set null' }),
    linkedAssetId: text('linked_asset_id'),
    caseType: removalCaseTypeEnum('case_type').notNull(),
    platform: text('platform').notNull(),
    targetUrl: text('target_url').notNull(),
    legalBasis: text('legal_basis'),
    status: removalStatusEnum('status').notNull().default('open'),
    severity: severityEnum('severity').notNull(),
    summary: text('summary').notNull(),
    evidenceCoverage: evidenceCoverageEnum('evidence_coverage').notNull().default('partial'),
    slaRisk: slaRiskEnum('sla_risk').notNull().default('watch'),
    reviewStatus: reviewStatusEnum('review_status').notNull().default('open'),
    supportRequested: boolean('support_requested').notNull().default(true),
    nextActionLabel: text('next_action_label'),
    lastUpdateAt: timestamp('last_update_at', { withTimezone: true }).notNull().defaultNow(),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('removal_cases_owner_user_idx').on(table.ownerUserId),
    linkedCheckIdx: index('removal_cases_linked_check_idx').on(table.linkedCheckId),
    statusIdx: index('removal_cases_status_idx').on(table.status),
    platformIdx: index('removal_cases_platform_idx').on(table.platform),
  }),
);

export const removalActionsTable = pgTable(
  'removal_actions',
  {
    id: text('id').primaryKey(),
    removalCaseId: text('removal_case_id')
      .notNull()
      .references(() => removalCasesTable.id, { onDelete: 'cascade' }),
    actionType: text('action_type').notNull(),
    recipient: text('recipient'),
    payloadSummary: text('payload_summary'),
    resultStatus: text('result_status'),
    externalTicketId: text('external_ticket_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    removalCaseIdx: index('removal_actions_removal_case_idx').on(table.removalCaseId),
    resultStatusIdx: index('removal_actions_result_status_idx').on(table.resultStatus),
  }),
);

export const reviewItemsTable = pgTable(
  'review_items',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id'),
    checkId: text('check_id').references(() => checksTable.id, { onDelete: 'set null' }),
    sourceId: text('source_id').references(() => sourcesTable.id, { onDelete: 'set null' }),
    supportRequestId: text('support_request_id').references(() => supportRequestsTable.id, { onDelete: 'set null' }),
    removalCaseId: text('removal_case_id').references(() => removalCasesTable.id, { onDelete: 'set null' }),
    reviewType: reviewTypeEnum('review_type').notNull(),
    priority: reviewPriorityEnum('priority').notNull().default('medium'),
    status: reviewStatusEnum('status').notNull().default('open'),
    assignedTo: text('assigned_to'),
    evidenceCoverage: evidenceCoverageEnum('evidence_coverage').notNull().default('partial'),
    slaRisk: slaRiskEnum('sla_risk').notNull().default('watch'),
    recommendedAction: recommendedActionEnum('recommended_action'),
    decisionOutcome: reviewDecisionOutcomeEnum('decision_outcome'),
    decisionSummary: text('decision_summary'),
    queueName: text('queue_name').notNull().default('reviews'),
    dueAt: timestamp('due_at', { withTimezone: true }),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('review_items_owner_user_idx').on(table.ownerUserId),
    checkIdx: index('review_items_check_idx').on(table.checkId),
    supportRequestIdx: index('review_items_support_request_idx').on(table.supportRequestId),
    removalCaseIdx: index('review_items_removal_case_idx').on(table.removalCaseId),
    statusIdx: index('review_items_status_idx').on(table.status),
    assignedToIdx: index('review_items_assigned_to_idx').on(table.assignedTo),
  }),
);

export const evidenceSnapshotsTable = pgTable(
  'evidence_snapshots',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id'),
    checkId: text('check_id').references(() => checksTable.id, { onDelete: 'set null' }),
    sourceId: text('source_id').references(() => sourcesTable.id, { onDelete: 'set null' }),
    reviewItemId: text('review_item_id').references(() => reviewItemsTable.id, { onDelete: 'set null' }),
    removalCaseId: text('removal_case_id').references(() => removalCasesTable.id, { onDelete: 'set null' }),
    snapshotType: evidenceSnapshotTypeEnum('snapshot_type').notNull(),
    sourceKind: evidenceSourceKindEnum('source_kind').notNull(),
    sourceStatus: evidenceSourceStatusEnum('source_status').notNull().default('pending'),
    sourceUrl: text('source_url'),
    storageKey: text('storage_key'),
    sha256: text('sha256'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default(defaultEmptyJsonObject),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default(defaultEmptyJsonObject),
    capturedAt: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('evidence_snapshots_owner_user_idx').on(table.ownerUserId),
    checkIdx: index('evidence_snapshots_check_idx').on(table.checkId),
    reviewItemIdx: index('evidence_snapshots_review_item_idx').on(table.reviewItemId),
    removalCaseIdx: index('evidence_snapshots_removal_case_idx').on(table.removalCaseId),
    sourceStatusIdx: index('evidence_snapshots_source_status_idx').on(table.sourceStatus),
  }),
);

export const jobsTable = pgTable(
  'jobs',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id'),
    queue: text('queue').notNull(),
    name: text('name').notNull(),
    status: jobStatusEnum('status').notNull().default('queued'),
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default(defaultEmptyJsonObject),
    requestedBy: text('requested_by'),
    attempts: integer('attempts').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(1),
    dedupeKey: text('dedupe_key'),
    lastError: text('last_error'),
    enqueuedAt: timestamp('enqueued_at', { withTimezone: true }).notNull().defaultNow(),
    availableAt: timestamp('available_at', { withTimezone: true }).notNull().defaultNow(),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('jobs_owner_user_idx').on(table.ownerUserId),
    queueIdx: index('jobs_queue_idx').on(table.queue),
    statusIdx: index('jobs_status_idx').on(table.status),
    resourceIdx: index('jobs_resource_idx').on(table.resourceType, table.resourceId),
  }),
);

export type CheckRow = typeof checksTable.$inferSelect;
export type CheckInsert = typeof checksTable.$inferInsert;
export type AssetRow = typeof assetsTable.$inferSelect;
export type AssetInsert = typeof assetsTable.$inferInsert;
export type SourceRow = typeof sourcesTable.$inferSelect;
export type SourceInsert = typeof sourcesTable.$inferInsert;
export type SupportRequestRow = typeof supportRequestsTable.$inferSelect;
export type SupportRequestInsert = typeof supportRequestsTable.$inferInsert;
export type RemovalCaseRow = typeof removalCasesTable.$inferSelect;
export type RemovalCaseInsert = typeof removalCasesTable.$inferInsert;
export type RemovalActionRow = typeof removalActionsTable.$inferSelect;
export type RemovalActionInsert = typeof removalActionsTable.$inferInsert;
export type ReviewItemRow = typeof reviewItemsTable.$inferSelect;
export type ReviewItemInsert = typeof reviewItemsTable.$inferInsert;
export type EvidenceSnapshotRow = typeof evidenceSnapshotsTable.$inferSelect;
export type EvidenceSnapshotInsert = typeof evidenceSnapshotsTable.$inferInsert;
export type JobRow = typeof jobsTable.$inferSelect;
export type JobInsert = typeof jobsTable.$inferInsert;

export const drizzleSchema = {
  checksTable,
  assetsTable,
  sourcesTable,
  supportRequestsTable,
  removalCasesTable,
  removalActionsTable,
  reviewItemsTable,
  evidenceSnapshotsTable,
  jobsTable,
};
