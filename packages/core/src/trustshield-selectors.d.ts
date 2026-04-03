import type { RemovalCaseRecord, RemovalFilterState, ReviewQueueFilterState, ReviewQueueItem, SearchFilterState, SupportQueueFilterState, SupportQueueItem, UnifiedSearchRecord } from './trustshield-records.js';
import type { ReviewDecisionOutcome } from './status.js';
export type OutcomeActionState = {
    status: 'ready' | 'in_progress' | 'blocked';
    label: string;
    hint: string;
};
export declare function selectOutcomeActionStates(items: ReviewQueueItem[], outcomes: ReviewDecisionOutcome[]): Record<string, OutcomeActionState>;
export declare function matchesSearchFilter(record: UnifiedSearchRecord, filterState: SearchFilterState): boolean;
export declare function selectSearchRecords(records: UnifiedSearchRecord[], filterState: SearchFilterState): UnifiedSearchRecord[];
export declare function matchesRemovalFilter(record: RemovalCaseRecord, filterState: RemovalFilterState): boolean;
export declare function selectRemovalCases(records: RemovalCaseRecord[], filterState: RemovalFilterState): RemovalCaseRecord[];
export declare function matchesReviewQueueFilter(item: ReviewQueueItem, filterState: ReviewQueueFilterState): boolean;
export declare function selectReviewQueueItems(items: ReviewQueueItem[], filterState: ReviewQueueFilterState): ReviewQueueItem[];
export declare function matchesSupportQueueFilter(item: SupportQueueItem, filterState: SupportQueueFilterState): boolean;
export declare function selectSupportQueueItems(items: SupportQueueItem[], filterState: SupportQueueFilterState): SupportQueueItem[];
export declare function getSearchFilterSummary(filterState: SearchFilterState): {
    hasActiveFilters: boolean;
    activeFilterCount: number;
};
export declare function getRemovalFilterSummary(filterState: RemovalFilterState): {
    hasActiveFilters: boolean;
    activeFilterCount: number;
};
export declare function getReviewQueueFilterSummary(filterState: ReviewQueueFilterState): {
    hasActiveFilters: boolean;
    activeFilterCount: number;
};
export declare function getSupportQueueFilterSummary(filterState: SupportQueueFilterState): {
    hasActiveFilters: boolean;
    activeFilterCount: number;
};
