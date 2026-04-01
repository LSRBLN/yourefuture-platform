export type SortDirection = 'asc' | 'desc';

export type SearchExecutionStatus = 'pending' | 'queued' | 'running' | 'completed' | 'partial_failure' | 'failed' | 'cancelled';

export type CheckType = 'leak_email' | 'leak_username' | 'leak_phone' | 'leak_domain' | 'password_hash' | 'image' | 'video' | 'source_only';

export type CheckStatus = SearchExecutionStatus;

export type AssetType = 'image' | 'video' | 'document' | 'other';

export type AssetStatus = 'pending_upload' | 'uploaded' | 'scanning' | 'ready' | 'flagged' | 'failed';

export type SourceType = 'profile_url' | 'listing_url' | 'image_url' | 'video_url' | 'document_url' | 'social_post_url' | 'other_url';

export type SourceValidationStatus = 'pending' | 'validated' | 'invalid' | 'rejected';

export type MatchType = 'exact_hash' | 'perceptual_hash' | 'face_match' | 'video_match' | 'text_match' | 'listing_match' | 'provider_hit' | 'manual_report';

export type WorkflowStatus = 'active' | 'completed' | 'cancelled';

export type WorkflowStepStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'blocked';

export type RemovalCaseType = 'privacy_removal' | 'non_consensual_intimate_content' | 'impersonation' | 'defamation' | 'copyright' | 'other';

export type ReviewType = 'analyst' | 'support_escalation' | 'removal_review';

export type ReviewPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ReviewStatus = 'open' | 'triaged' | 'assigned' | 'in_review' | 'waiting_more_context' | 'decided' | 'escalated' | 'closed';

export type ReviewDecisionOutcome =
  | 'no_evidence_of_manipulation'
  | 'suspicious_needs_monitoring'
  | 'likely_manipulated'
  | 'confirmed_known_fake'
  | 'insufficient_evidence'
  | 'no_match'
  | 'weak_candidate'
  | 'strong_candidate_reviewed'
  | 'insufficient_quality'
  | 'not_actionable'
  | 'monitor'
  | 'action_recommended'
  | 'removal_recommended';

export type RecommendedAction = 'monitor' | 'rerun_analysis' | 'request_more_context' | 'handover_support' | 'recommend_removal' | 'legal_escalation';

export type RemovalStatus = 'open' | 'preparing' | 'submitted' | 'under_review' | 'followup_required' | 'escalated' | 'removed' | 'partially_removed' | 'rejected' | 'closed';

export type RemovalActionType = 'email_notice' | 'webform_notice' | 'api_notice' | 'followup' | 'legal_escalation' | 'internal_note';

export type SupportRequestType = 'support' | 'removal' | 'upload_review' | 'identity_review';

export type SupportStatus = 'open' | 'triaged' | 'assigned' | 'in_progress' | 'waiting_user' | 'escalated' | 'resolved' | 'closed';

export type ProviderCategory = 'leak' | 'search' | 'social' | 'video' | 'image' | 'registry' | 'other';

export type ProviderStatus = 'active' | 'degraded' | 'disabled' | 'maintenance';

export type EvidenceCoverage = 'complete' | 'partial' | 'missing';

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type SlaRisk = 'healthy' | 'watch' | 'risk' | 'breach';

export type WorkflowStatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type SearchQueryType = 'person' | 'asset' | 'url' | 'platform';

export type SearchCandidateType = 'profile' | 'listing' | 'image' | 'video' | 'document';

export type SearchRetrievalMethod = 'exact' | 'fuzzy' | 'embedding' | 'hybrid';

export type SearchSortField = 'updatedAt' | 'priority' | 'slaRisk' | 'score';

export type AssetRepresentationType = 'exact_hash' | 'phash' | 'embedding' | 'audio_fingerprint' | 'transcript' | 'ocr';

export type TextArtifactType = 'ocr' | 'transcript';

export type EvidenceSnapshotType = 'search_result' | 'review_brief' | 'provider_packet';

export type EvidenceSourceKind = 'url' | 'screenshot' | 'document' | 'audit_log';

export type EvidenceSourceStatus = 'verified' | 'pending' | 'missing';

export type StatusBadgeDefinition = {
  label: string;
  tone: WorkflowStatusTone;
};

export const statusToneClassNames: Record<WorkflowStatusTone, string> = {
  neutral: 'bg-[#eceff2] text-slate-600',
  info: 'bg-[#eef3fb] text-[#094cb2]',
  success: 'bg-[#e9f3ec] text-[#1f6b45]',
  warning: 'bg-[#f3efe7] text-[#6d5e00]',
  danger: 'bg-[#f8e8e7] text-[#a0362f]',
};

export const reviewPriorityBadgeMap: Record<ReviewPriority, StatusBadgeDefinition> = {
  low: { label: 'low', tone: 'neutral' },
  medium: { label: 'medium', tone: 'warning' },
  high: { label: 'high', tone: 'danger' },
  urgent: { label: 'urgent', tone: 'danger' },
};

export const supportStatusBadgeMap: Record<SupportStatus, StatusBadgeDefinition> = {
  open: { label: 'open', tone: 'info' },
  triaged: { label: 'triaged', tone: 'warning' },
  assigned: { label: 'assigned', tone: 'success' },
  in_progress: { label: 'in progress', tone: 'info' },
  waiting_user: { label: 'waiting user', tone: 'warning' },
  escalated: { label: 'escalated', tone: 'danger' },
  resolved: { label: 'resolved', tone: 'success' },
  closed: { label: 'closed', tone: 'neutral' },
};

export const reviewStatusBadgeMap: Record<ReviewStatus, StatusBadgeDefinition> = {
  open: { label: 'open', tone: 'info' },
  triaged: { label: 'triaged', tone: 'warning' },
  assigned: { label: 'assigned', tone: 'success' },
  in_review: { label: 'in review', tone: 'info' },
  waiting_more_context: { label: 'waiting context', tone: 'warning' },
  decided: { label: 'decided', tone: 'success' },
  escalated: { label: 'escalated', tone: 'danger' },
  closed: { label: 'closed', tone: 'neutral' },
};

export const removalStatusBadgeMap: Record<RemovalStatus, StatusBadgeDefinition> = {
  open: { label: 'open', tone: 'neutral' },
  preparing: { label: 'preparing', tone: 'warning' },
  submitted: { label: 'submitted', tone: 'warning' },
  under_review: { label: 'under review', tone: 'info' },
  followup_required: { label: 'follow-up required', tone: 'danger' },
  escalated: { label: 'escalated', tone: 'danger' },
  removed: { label: 'removed', tone: 'success' },
  partially_removed: { label: 'partially removed', tone: 'warning' },
  rejected: { label: 'rejected', tone: 'neutral' },
  closed: { label: 'closed', tone: 'neutral' },
};

export const evidenceCoverageBadgeMap: Record<EvidenceCoverage, StatusBadgeDefinition> = {
  complete: { label: 'evidence complete', tone: 'success' },
  partial: { label: 'evidence partial', tone: 'warning' },
  missing: { label: 'evidence missing', tone: 'danger' },
};

export const slaRiskBadgeMap: Record<SlaRisk, StatusBadgeDefinition> = {
  healthy: { label: 'sla healthy', tone: 'success' },
  watch: { label: 'sla watch', tone: 'warning' },
  risk: { label: 'sla risk', tone: 'danger' },
  breach: { label: 'sla breach', tone: 'danger' },
};

export const supportRequestTypeLabels: Record<SupportRequestType, string> = {
  support: 'Support',
  removal: 'Removal',
  upload_review: 'Upload Review',
  identity_review: 'Identity Review',
};

export const severityTextClassNames: Record<Severity, string> = {
  low: 'text-stone-500',
  medium: 'text-[#6d5e00]',
  high: 'text-[#a0362f]',
  critical: 'text-[#7a130d]',
};
