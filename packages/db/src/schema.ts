import { sql } from 'drizzle-orm';
import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

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
export const osintQueryTypeEnum = pgEnum('osint_query_type', ['username', 'email', 'phone', 'domain', 'ip', 'name', 'image_url']);
export const osintSearchScopeEnum = pgEnum('osint_search_scope', ['quick', 'comprehensive']);
export const osintSearchStatusEnum = pgEnum('osint_search_status', ['queued', 'running', 'completed', 'failed']);
export const osintExportFormatEnum = pgEnum('osint_export_format', ['json', 'csv', 'pdf']);
export const osintExportStatusEnum = pgEnum('osint_export_status', ['queued', 'running', 'completed', 'failed']);
export const osintHistoryEventTypeEnum = pgEnum('osint_history_event_type', [
  'search_created',
  'job_queued',
  'job_running',
  'job_completed',
  'job_failed',
  'export_queued',
  'export_completed',
  'export_failed',
  'saved_item_added',
  'saved_item_removed',
]);

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

export const osintSearchesTable = pgTable(
  'osint_searches',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id'),
    query: text('query').notNull(),
    queryType: osintQueryTypeEnum('query_type').notNull(),
    scope: osintSearchScopeEnum('scope').notNull().default('quick'),
    status: osintSearchStatusEnum('status').notNull().default('queued'),
    schemaVersion: text('schema_version').notNull().default('1.0'),
    requestedBy: text('requested_by'),
    providers: jsonb('providers').$type<string[]>().notNull().default(defaultEmptyJsonArray),
    resultCount: integer('result_count').notNull().default(0),
    dedupeKey: text('dedupe_key'),
    latestJobId: text('latest_job_id'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    lastError: text('last_error'),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('osint_searches_owner_user_idx').on(table.ownerUserId),
    statusIdx: index('osint_searches_status_idx').on(table.status),
    queryTypeIdx: index('osint_searches_query_type_idx').on(table.queryType),
    dedupeKeyIdx: index('osint_searches_dedupe_key_idx').on(table.dedupeKey),
  }),
);

export const osintResultsTable = pgTable(
  'osint_results',
  {
    id: text('id').primaryKey(),
    searchId: text('search_id')
      .notNull()
      .references(() => osintSearchesTable.id, { onDelete: 'cascade' }),
    ownerUserId: text('owner_user_id'),
    sourceTool: text('source_tool').notNull(),
    sourceProvider: text('source_provider'),
    sourceUrl: text('source_url'),
    sourceTitle: text('source_title'),
    confidenceScore: integer('confidence_score').notNull().default(0),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default(defaultEmptyJsonObject),
    discoveredAt: timestamp('discovered_at', { withTimezone: true }),
    collectedAt: timestamp('collected_at', { withTimezone: true }),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    searchIdx: index('osint_results_search_idx').on(table.searchId),
    ownerUserIdx: index('osint_results_owner_user_idx').on(table.ownerUserId),
    sourceUrlIdx: index('osint_results_source_url_idx').on(table.sourceUrl),
  }),
);

export const osintExportsTable = pgTable(
  'osint_exports',
  {
    id: text('id').primaryKey(),
    searchId: text('search_id')
      .notNull()
      .references(() => osintSearchesTable.id, { onDelete: 'cascade' }),
    ownerUserId: text('owner_user_id'),
    format: osintExportFormatEnum('format').notNull(),
    status: osintExportStatusEnum('status').notNull().default('queued'),
    requestedBy: text('requested_by'),
    fileName: text('file_name'),
    storageKey: text('storage_key'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    errorMessage: text('error_message'),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    searchIdx: index('osint_exports_search_idx').on(table.searchId),
    ownerUserIdx: index('osint_exports_owner_user_idx').on(table.ownerUserId),
    statusIdx: index('osint_exports_status_idx').on(table.status),
  }),
);

export const osintHistoryTable = pgTable(
  'osint_history',
  {
    id: text('id').primaryKey(),
    searchId: text('search_id')
      .notNull()
      .references(() => osintSearchesTable.id, { onDelete: 'cascade' }),
    ownerUserId: text('owner_user_id'),
    eventType: osintHistoryEventTypeEnum('event_type').notNull(),
    message: text('message'),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default(defaultEmptyJsonObject),
    createdBy: text('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    searchIdx: index('osint_history_search_idx').on(table.searchId),
    ownerUserIdx: index('osint_history_owner_user_idx').on(table.ownerUserId),
    eventTypeIdx: index('osint_history_event_type_idx').on(table.eventType),
  }),
);

export const osintSavedItemsTable = pgTable(
  'osint_saved_items',
  {
    id: text('id').primaryKey(),
    ownerUserId: text('owner_user_id').notNull(),
    searchId: text('search_id').references(() => osintSearchesTable.id, { onDelete: 'set null' }),
    resultId: text('result_id').references(() => osintResultsTable.id, { onDelete: 'set null' }),
    title: text('title'),
    url: text('url').notNull(),
    notes: text('notes'),
    tags: jsonb('tags').$type<string[]>().notNull().default(defaultEmptyJsonArray),
    retentionUntil: timestamp('retention_until', { withTimezone: true }),
    ...timestampColumns,
  },
  (table) => ({
    ownerUserIdx: index('osint_saved_items_owner_user_idx').on(table.ownerUserId),
    searchIdx: index('osint_saved_items_search_idx').on(table.searchId),
    resultIdx: index('osint_saved_items_result_idx').on(table.resultId),
    urlIdx: index('osint_saved_items_url_idx').on(table.url),
  }),
);

export const usersTable = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    bio: text('bio'),
    avatarUrl: text('avatar_url'),
    language: text('language').notNull().default('de'),
    theme: text('theme').notNull().default('dark'),
    isActive: boolean('is_active').notNull().default(true),
    emailVerified: boolean('email_verified').notNull().default(false),
    ...timestampColumns,
  },
  (table) => ({
    usersEmailUniqueIdx: uniqueIndex('users_email_unique_idx').on(table.email),
    usersIsActiveIdx: index('users_is_active_idx').on(table.isActive),
  }),
);

export const userImagesTable = pgTable(
  'user_images',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    fileSizeBytes: integer('file_size_bytes').notNull(),
    storageKey: text('storage_key').notNull(),
    imageUrl: text('image_url'),
    isPrimary: boolean('is_primary').notNull().default(false),
    ...timestampColumns,
  },
  (table) => ({
    userIdIdx: index('user_images_user_id_idx').on(table.userId),
  }),
);

export const userSessionsTable = pgTable(
  'user_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    jti: text('jti'),
    token: text('token').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    replacedBySessionId: text('replaced_by_session_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('user_sessions_user_id_idx').on(table.userId),
    jtiUniqueIdx: uniqueIndex('user_sessions_jti_unique_idx').on(table.jti),
    tokenUniqueIdx: uniqueIndex('user_sessions_token_unique_idx').on(table.token),
    expiresAtIdx: index('user_sessions_expires_at_idx').on(table.expiresAt),
    revokedAtIdx: index('user_sessions_revoked_at_idx').on(table.revokedAt),
    replacedBySessionIdIdx: index('user_sessions_replaced_by_session_id_idx').on(table.replacedBySessionId),
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
export type OsintSearchRow = typeof osintSearchesTable.$inferSelect;
export type OsintSearchInsert = typeof osintSearchesTable.$inferInsert;
export type OsintResultRow = typeof osintResultsTable.$inferSelect;
export type OsintResultInsert = typeof osintResultsTable.$inferInsert;
export type OsintExportRow = typeof osintExportsTable.$inferSelect;
export type OsintExportInsert = typeof osintExportsTable.$inferInsert;
export type OsintHistoryRow = typeof osintHistoryTable.$inferSelect;
export type OsintHistoryInsert = typeof osintHistoryTable.$inferInsert;
export type OsintSavedItemRow = typeof osintSavedItemsTable.$inferSelect;
export type OsintSavedItemInsert = typeof osintSavedItemsTable.$inferInsert;
export type UserRow = typeof usersTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;
export type UserImageRow = typeof userImagesTable.$inferSelect;
export type UserImageInsert = typeof userImagesTable.$inferInsert;
export type UserSessionRow = typeof userSessionsTable.$inferSelect;
export type UserSessionInsert = typeof userSessionsTable.$inferInsert;

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
  osintSearchesTable,
  osintResultsTable,
  osintExportsTable,
  osintHistoryTable,
  osintSavedItemsTable,
  usersTable,
  userImagesTable,
  userSessionsTable,
};
