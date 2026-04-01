import type { AssetRepresentationType, AssetStatus, AssetType, CheckStatus, CheckType, EvidenceCoverage, EvidenceSnapshotType, EvidenceSourceKind, EvidenceSourceStatus, MatchType, ProviderCategory, ProviderStatus, RecommendedAction, RemovalActionType, RemovalCaseType, RemovalStatus, ReviewDecisionOutcome, ReviewPriority, ReviewStatus, ReviewType, SearchCandidateType, SearchExecutionStatus, SearchQueryType, SearchRetrievalMethod, SearchSortField, Severity, SlaRisk, SortDirection, SourceType, SourceValidationStatus, SupportRequestType, SupportStatus, TextArtifactType, WorkflowStatus, WorkflowStepStatus } from './status.js';
export type SearchSort = {
    field: SearchSortField;
    direction: SortDirection;
};
export type SearchFilterState = {
    query: string;
    statuses: SearchExecutionStatus[];
    reviewPriorities: ReviewPriority[];
    evidenceCoverage: EvidenceCoverage[];
    platforms: string[];
    assignedTo: string[];
    onlyEscalated: boolean;
    includeSensitive: boolean;
    sort: SearchSort;
};
export type ReviewQueueFilterState = {
    query: string;
    priorities: ReviewPriority[];
    statuses: ReviewStatus[];
    types: ReviewType[];
    assignedTo: string[];
    evidenceCoverage: EvidenceCoverage[];
    slaRisks: SlaRisk[];
    linkedRemovalCaseIds: string[];
    linkedSupportRequestIds: string[];
    onlyUnassigned: boolean;
    onlyEscalated: boolean;
    sort: SearchSort;
};
export type RemovalFilterState = {
    query: string;
    statuses: RemovalStatus[];
    severities: Severity[];
    evidenceCoverage: EvidenceCoverage[];
    slaRisks: SlaRisk[];
    platforms: string[];
    sort: SearchSort;
};
export type SupportQueueFilterState = {
    query: string;
    priorities: ReviewPriority[];
    requestTypes: SupportRequestType[];
    statuses: SupportStatus[];
    assignedTo: string[];
    slaRisks: SlaRisk[];
    sort: SearchSort;
};
export type TimestampedRecord = {
    createdAt: string;
    updatedAt: string;
};
export type SummaryRecord = {
    summary?: string;
};
export type CheckInput = {
    email?: string;
    username?: string;
    phone?: string;
    domain?: string;
    passwordHashPrefix?: string;
    assetId?: string;
    submittedSourceIds?: string[];
};
export type RiskAssessment = {
    score?: number;
    severity?: Severity;
    rationale?: string;
    flaggedSignals: string[];
};
export type CheckRecord = TimestampedRecord & SummaryRecord & {
    id: string;
    type: CheckType;
    status: CheckStatus;
    input: CheckInput;
    risk: RiskAssessment;
    submittedSourceIds: string[];
    primaryAssetId?: string;
    workflowInstanceId?: string;
    supportRequestId?: string;
    reviewItemIds: string[];
    removalCaseIds: string[];
};
export type AssetDimensions = {
    width?: number;
    height?: number;
    durationSeconds?: number;
};
export type AssetFlags = {
    nsfw: boolean;
    sensitive: boolean;
    malwareScanned: boolean;
    malwareDetected: boolean;
};
export type AssetRecord = TimestampedRecord & SummaryRecord & {
    id: string;
    assetType: AssetType;
    status: AssetStatus;
    originalFilename?: string;
    mimeType?: string;
    fileSizeBytes?: number;
    sha256?: string;
    dimensions: AssetDimensions;
    storageKey?: string;
    ownerUserId?: string;
    flags: AssetFlags;
    primaryCheckId?: string;
    representationIds: string[];
    sourceIds: string[];
};
export type AssetRepresentationRecord = {
    id: string;
    assetId: string;
    representationType: AssetRepresentationType;
    modelName?: string;
    modelVersion?: string;
    vectorReference?: string;
    qualityScore?: number;
    payload: Record<string, unknown>;
    createdAt: string;
};
export type FaceDetectionRecord = {
    id: string;
    assetId: string;
    keyframeAssetId?: string;
    bbox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    faceQualityScore?: number;
    pose?: Record<string, number>;
    occlusionScore?: number;
    embeddingRepresentationId?: string;
    createdAt: string;
};
export type FaceTrackRecord = {
    id: string;
    assetId: string;
    startSecond: number;
    endSecond: number;
    aggregatedQualityScore?: number;
    representativeEmbeddingId?: string;
    createdAt: string;
};
export type TextArtifactRecord = {
    id: string;
    assetId: string;
    artifactType: TextArtifactType;
    languageCode?: string;
    textContent: string;
    confidence?: number;
    segmentReference?: Record<string, unknown>;
    createdAt: string;
};
export type SourceRecord = TimestampedRecord & SummaryRecord & {
    id: string;
    sourceType: SourceType;
    sourceUrl: string;
    sourceDomain?: string;
    platformName?: string;
    pageTitle?: string;
    notes?: string;
    validationStatus: SourceValidationStatus;
    assetId?: string;
    checkId?: string;
    submittedByUserId?: string;
};
export type ContentMatchRecord = TimestampedRecord & SummaryRecord & {
    id: string;
    assetId?: string;
    checkId?: string;
    sourceId?: string;
    providerId?: string;
    matchType: MatchType;
    matchedUrl?: string;
    platformName?: string;
    firstSeenAt?: string;
    lastSeenAt?: string;
    confidence?: number;
    knownFake: boolean;
    knownLeak: boolean;
    active: boolean;
    reviewItemId?: string;
    removalCaseId?: string;
};
export type WorkflowStepRecord = {
    id: string;
    workflowStepId: string;
    status: WorkflowStepStatus;
    title: string;
    description?: string;
    requiresConfirmation: boolean;
    supportHandoverPossible: boolean;
    notes?: string;
    updatedAt: string;
};
export type WorkflowRecord = TimestampedRecord & {
    id: string;
    workflowId: string;
    checkId?: string;
    status: WorkflowStatus;
    currentStepIndex: number;
    steps: WorkflowStepRecord[];
};
export type EvidenceSource = {
    id: string;
    label: string;
    kind: EvidenceSourceKind;
    status: EvidenceSourceStatus;
};
export type EvidenceSnapshot = {
    id: string;
    snapshotType: EvidenceSnapshotType;
    summary: string;
    coverage: EvidenceCoverage;
    retentionNote: string;
    capturedAt: string;
    linkedAssetId?: string;
    linkedCheckId?: string;
    linkedMatchId?: string;
    linkedReviewItemId?: string;
    sources: EvidenceSource[];
    evidence: Record<string, unknown>;
};
export type ReviewDecisionRecord = {
    id: string;
    reviewItemId: string;
    reviewerUserId: string;
    decisionType: ReviewDecisionOutcome;
    rationale: string;
    evidenceSnapshotId?: string;
    createdAt: string;
};
export type ReviewQueueItem = TimestampedRecord & SummaryRecord & {
    id: string;
    reviewType: ReviewType;
    priority: ReviewPriority;
    status: ReviewStatus;
    linkedCheckId?: string;
    linkedAssetId?: string;
    linkedMatchId?: string;
    linkedRemovalCaseId?: string;
    linkedSupportRequestId?: string;
    assignedTo?: string;
    recommendedAction: RecommendedAction;
    finalDecision?: ReviewDecisionOutcome;
    reviewerNotes?: string;
    evidenceSnapshot: EvidenceSnapshot;
};
export type RemovalActionRecord = {
    id: string;
    actionType: RemovalActionType;
    recipient?: string;
    payloadSummary?: string;
    resultStatus?: string;
    externalTicketId?: string;
    createdAt: string;
};
export type RemovalCaseRecord = TimestampedRecord & SummaryRecord & {
    id: string;
    caseType: RemovalCaseType;
    platform: string;
    targetUrl: string;
    legalBasis?: string;
    status: RemovalStatus;
    severity: Severity;
    evidenceCoverage: EvidenceCoverage;
    slaRisk: SlaRisk;
    reviewStatus: ReviewStatus;
    supportRequested: boolean;
    assignedTo?: string;
    linkedAssetId?: string;
    linkedMatchId?: string;
    linkedCheckId?: string;
    nextActionLabel: string;
    evidenceSnapshot: EvidenceSnapshot;
    actions: RemovalActionRecord[];
    lastUpdateAt: string;
};
export type SupportRequestRecord = TimestampedRecord & {
    id: string;
    requestType: SupportRequestType;
    priority: ReviewPriority;
    status: SupportStatus;
    preferredContact?: string;
    message: string;
    checkId?: string;
    assetId?: string;
    removalCaseId?: string;
    assignedTo?: string;
    assignmentHistory: {
        assignedTo?: string;
        assignedBy?: string;
        reason?: string;
        changedAt: string;
    }[];
    statusHistory: {
        fromStatus?: SupportStatus;
        toStatus: SupportStatus;
        changedBy?: string;
        reason?: string;
        changedAt: string;
    }[];
    audit: {
        createdBy?: string;
        lastModifiedBy?: string;
        lastAction?: string;
    };
    retention: {
        policyKey: string;
        retainUntil: string;
        lastReviewedAt: string;
    };
};
export type CheckValidationIssue = {
    field: string;
    message: string;
};
export type ValidationResult = {
    valid: boolean;
    issues: CheckValidationIssue[];
};
export declare function validateCheckRecord(record: CheckRecord): ValidationResult;
export declare function validateSourceRecord(record: SourceRecord): ValidationResult;
export declare function validateContentMatchRecord(record: ContentMatchRecord): ValidationResult;
export declare function validateReviewQueueItem(item: ReviewQueueItem): ValidationResult;
export declare function validateRemovalCaseRecord(record: RemovalCaseRecord): ValidationResult;
export declare function validateSupportRequestRecord(record: SupportRequestRecord): ValidationResult;
export type SupportQueueItem = {
    id: string;
    requesterLabel: string;
    priority: ReviewPriority;
    requestType: SupportRequestType;
    status: SupportStatus;
    assignedTo?: string;
    slaRisk: SlaRisk;
    slaDueAt?: string;
    updatedAt: string;
    note: string;
    linkedReviewItemId?: string;
    linkedRemovalCaseId?: string;
    evidenceCoverage: EvidenceCoverage;
};
export type ProviderCapability = 'search' | 'match' | 'review_export' | 'removal_submission' | 'status_sync';
export type ProviderRecord = TimestampedRecord & SummaryRecord & {
    id: string;
    slug: string;
    displayName: string;
    category: ProviderCategory;
    status: ProviderStatus;
    capabilities: ProviderCapability[];
    supportedSourceTypes: SourceType[];
    supportsAsyncJobs: boolean;
    rateLimitPerMinute?: number;
    baseUrl?: string;
    documentationUrl?: string;
    retentionHint?: string;
};
export type SearchCandidate = {
    id: string;
    candidateUrl: string;
    candidateSource: string;
    candidateType: SearchCandidateType;
    retrievalMethod: SearchRetrievalMethod;
    rawScore: number;
    rerankedScore: number;
    rankPosition: number;
    promotedToMatch: boolean;
    relatedMatchId?: string;
};
export type UnifiedSearchRecord = TimestampedRecord & SummaryRecord & {
    id: string;
    title: string;
    platform: string;
    queryType: SearchQueryType;
    searchStatus: SearchExecutionStatus;
    reviewPriority: ReviewPriority;
    reviewStatus: ReviewStatus;
    removalStatus: RemovalStatus;
    supportStatus: SupportStatus;
    evidenceCoverage: EvidenceCoverage;
    severity: Severity;
    slaRisk: SlaRisk;
    assignedTo?: string;
    nextActionLabel: string;
    evidenceSnapshot: EvidenceSnapshot;
    linkedCheckId?: string;
    linkedAssetId?: string;
    linkedRemovalCaseId?: string;
    linkedSupportRequestId?: string;
    candidates: SearchCandidate[];
};
export declare const defaultSupportQueueFilterState: SupportQueueFilterState;
export declare const defaultReviewQueueFilterState: ReviewQueueFilterState;
export declare const defaultRemovalFilterState: RemovalFilterState;
export declare const defaultSearchFilterState: SearchFilterState;
