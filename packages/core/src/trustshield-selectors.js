function normalizeFilterQuery(query) {
    return query.trim().toLowerCase();
}
function matchesFilterQuery(query, values) {
    const normalizedQuery = normalizeFilterQuery(query);
    if (!normalizedQuery) {
        return true;
    }
    return values.some((value) => value?.toLowerCase().includes(normalizedQuery));
}
function matchesArrayFilter(selectedValues, candidateValue) {
    if (selectedValues.length === 0) {
        return true;
    }
    return candidateValue ? selectedValues.includes(candidateValue) : false;
}
function matchesStringListFilter(selectedValues, candidateValue) {
    if (selectedValues.length === 0) {
        return true;
    }
    return candidateValue ? selectedValues.includes(candidateValue) : false;
}
function compareText(left, right, direction) {
    const result = (left ?? '').localeCompare(right ?? '', undefined, { sensitivity: 'base' });
    return direction === 'asc' ? result : result * -1;
}
function comparePriority(left, right, direction) {
    const priorityRank = { low: 0, medium: 1, high: 2, urgent: 3 };
    const result = priorityRank[left] - priorityRank[right];
    return direction === 'asc' ? result : result * -1;
}
function compareSlaRisk(left, right, direction) {
    const slaRiskRank = { healthy: 0, watch: 1, risk: 2, breach: 3 };
    const result = slaRiskRank[left] - slaRiskRank[right];
    return direction === 'asc' ? result : result * -1;
}
export function selectOutcomeActionStates(items, outcomes) {
    return outcomes.reduce((accumulator, outcome) => {
        const matchingItems = items.filter((item) => item.finalDecision === outcome);
        if (matchingItems.length === 0) {
            accumulator[outcome] = {
                status: 'blocked',
                label: 'Wartet auf Outcome',
                hint: 'Noch kein Review-Objekt mit passender finalDecision in der aktuellen Queue-Auswahl.',
            };
            return accumulator;
        }
        const hasClosed = matchingItems.some((item) => item.status === 'closed');
        accumulator[outcome] = hasClosed
            ? {
                status: 'ready',
                label: 'Aktion abgeschlossen',
                hint: 'Mindestens ein passendes Review-Objekt wurde geschlossen und ist auditierbar dokumentiert.',
            }
            : {
                status: 'in_progress',
                label: 'Aktion ausführbar',
                hint: 'Outcome ist vorhanden; operativer Folgepfad kann unmittelbar ausgeführt werden.',
            };
        return accumulator;
    }, {});
}
export function matchesSearchFilter(record, filterState) {
    return (matchesFilterQuery(filterState.query, [record.id, record.title, record.platform, record.summary, record.assignedTo, record.nextActionLabel]) &&
        matchesArrayFilter(filterState.statuses, record.searchStatus) &&
        matchesArrayFilter(filterState.reviewPriorities, record.reviewPriority) &&
        matchesArrayFilter(filterState.evidenceCoverage, record.evidenceCoverage) &&
        matchesStringListFilter(filterState.platforms, record.platform) &&
        matchesStringListFilter(filterState.assignedTo, record.assignedTo) &&
        (!filterState.onlyEscalated || record.reviewStatus === 'escalated' || record.removalStatus === 'escalated' || record.supportStatus === 'escalated') &&
        (filterState.includeSensitive || record.evidenceCoverage !== 'missing'));
}
export function selectSearchRecords(records, filterState) {
    return records.filter((record) => matchesSearchFilter(record, filterState)).sort((left, right) => {
        switch (filterState.sort.field) {
            case 'priority':
                return comparePriority(left.reviewPriority, right.reviewPriority, filterState.sort.direction);
            case 'slaRisk':
                return compareSlaRisk(left.slaRisk, right.slaRisk, filterState.sort.direction);
            case 'score': {
                const leftScore = left.candidates[0]?.rerankedScore ?? 0;
                const rightScore = right.candidates[0]?.rerankedScore ?? 0;
                return filterState.sort.direction === 'asc' ? leftScore - rightScore : rightScore - leftScore;
            }
            case 'updatedAt':
            default:
                return compareText(left.updatedAt, right.updatedAt, filterState.sort.direction);
        }
    });
}
export function matchesRemovalFilter(record, filterState) {
    return (matchesFilterQuery(filterState.query, [record.id, record.platform, record.targetUrl, record.legalBasis, record.assignedTo, record.nextActionLabel]) &&
        matchesArrayFilter(filterState.statuses, record.status) &&
        matchesArrayFilter(filterState.severities, record.severity) &&
        matchesArrayFilter(filterState.evidenceCoverage, record.evidenceCoverage) &&
        matchesArrayFilter(filterState.slaRisks, record.slaRisk) &&
        matchesStringListFilter(filterState.platforms, record.platform));
}
export function selectRemovalCases(records, filterState) {
    return records.filter((record) => matchesRemovalFilter(record, filterState)).sort((left, right) => {
        switch (filterState.sort.field) {
            case 'slaRisk':
                return compareSlaRisk(left.slaRisk, right.slaRisk, filterState.sort.direction);
            case 'updatedAt':
            default:
                return compareText(left.lastUpdateAt, right.lastUpdateAt, filterState.sort.direction);
        }
    });
}
export function matchesReviewQueueFilter(item, filterState) {
    return (matchesFilterQuery(filterState.query, [
        item.id,
        item.summary,
        item.recommendedAction,
        item.finalDecision,
        item.reviewerNotes,
        item.assignedTo,
        item.linkedCheckId,
        item.linkedAssetId,
        item.linkedMatchId,
        item.linkedRemovalCaseId,
        item.linkedSupportRequestId,
    ]) &&
        matchesArrayFilter(filterState.priorities, item.priority) &&
        matchesArrayFilter(filterState.statuses, item.status) &&
        matchesArrayFilter(filterState.types, item.reviewType) &&
        matchesStringListFilter(filterState.assignedTo, item.assignedTo) &&
        matchesArrayFilter(filterState.evidenceCoverage, item.evidenceSnapshot.coverage) &&
        matchesArrayFilter(filterState.slaRisks, item.evidenceSnapshot.coverage === 'missing' ? 'breach' : item.evidenceSnapshot.coverage === 'partial' ? 'watch' : 'healthy') &&
        matchesStringListFilter(filterState.linkedRemovalCaseIds, item.linkedRemovalCaseId) &&
        matchesStringListFilter(filterState.linkedSupportRequestIds, item.linkedSupportRequestId) &&
        (!filterState.onlyUnassigned || !item.assignedTo || item.assignedTo === 'Offen') &&
        (!filterState.onlyEscalated || item.status === 'escalated'));
}
export function selectReviewQueueItems(items, filterState) {
    return items.filter((item) => matchesReviewQueueFilter(item, filterState)).sort((left, right) => {
        switch (filterState.sort.field) {
            case 'priority':
                return comparePriority(left.priority, right.priority, filterState.sort.direction);
            case 'updatedAt':
                return compareText(left.updatedAt, right.updatedAt, filterState.sort.direction);
            case 'slaRisk': {
                const leftRisk = left.evidenceSnapshot.coverage === 'missing' ? 'breach' : left.evidenceSnapshot.coverage === 'partial' ? 'watch' : 'healthy';
                const rightRisk = right.evidenceSnapshot.coverage === 'missing' ? 'breach' : right.evidenceSnapshot.coverage === 'partial' ? 'watch' : 'healthy';
                return compareSlaRisk(leftRisk, rightRisk, filterState.sort.direction);
            }
            default:
                return compareText(left.id, right.id, filterState.sort.direction);
        }
    });
}
export function matchesSupportQueueFilter(item, filterState) {
    return (matchesFilterQuery(filterState.query, [item.id, item.requesterLabel, item.note, item.assignedTo, item.linkedRemovalCaseId, item.linkedReviewItemId]) &&
        matchesArrayFilter(filterState.priorities, item.priority) &&
        matchesArrayFilter(filterState.requestTypes, item.requestType) &&
        matchesArrayFilter(filterState.statuses, item.status) &&
        matchesStringListFilter(filterState.assignedTo, item.assignedTo) &&
        matchesArrayFilter(filterState.slaRisks, item.slaRisk));
}
export function selectSupportQueueItems(items, filterState) {
    return items.filter((item) => matchesSupportQueueFilter(item, filterState)).sort((left, right) => {
        switch (filterState.sort.field) {
            case 'priority':
                return comparePriority(left.priority, right.priority, filterState.sort.direction);
            case 'slaRisk':
                return compareSlaRisk(left.slaRisk, right.slaRisk, filterState.sort.direction);
            case 'updatedAt':
            default:
                return compareText(left.updatedAt, right.updatedAt, filterState.sort.direction);
        }
    });
}
export function getSearchFilterSummary(filterState) {
    return {
        hasActiveFilters: Boolean(filterState.query) || filterState.statuses.length > 0 || filterState.reviewPriorities.length > 0 || filterState.evidenceCoverage.length > 0 || filterState.platforms.length > 0 || filterState.assignedTo.length > 0 || filterState.onlyEscalated || !filterState.includeSensitive,
        activeFilterCount: (filterState.query ? 1 : 0) + filterState.statuses.length + filterState.reviewPriorities.length + filterState.evidenceCoverage.length + filterState.platforms.length + filterState.assignedTo.length + (filterState.onlyEscalated ? 1 : 0) + (filterState.includeSensitive ? 0 : 1),
    };
}
export function getRemovalFilterSummary(filterState) {
    return {
        hasActiveFilters: Boolean(filterState.query) || filterState.statuses.length > 0 || filterState.severities.length > 0 || filterState.evidenceCoverage.length > 0 || filterState.slaRisks.length > 0 || filterState.platforms.length > 0,
        activeFilterCount: (filterState.query ? 1 : 0) + filterState.statuses.length + filterState.severities.length + filterState.evidenceCoverage.length + filterState.slaRisks.length + filterState.platforms.length,
    };
}
export function getReviewQueueFilterSummary(filterState) {
    return {
        hasActiveFilters: Boolean(filterState.query) ||
            filterState.priorities.length > 0 ||
            filterState.statuses.length > 0 ||
            filterState.types.length > 0 ||
            filterState.assignedTo.length > 0 ||
            filterState.evidenceCoverage.length > 0 ||
            filterState.slaRisks.length > 0 ||
            filterState.linkedRemovalCaseIds.length > 0 ||
            filterState.linkedSupportRequestIds.length > 0 ||
            filterState.onlyUnassigned ||
            filterState.onlyEscalated,
        activeFilterCount: (filterState.query ? 1 : 0) +
            filterState.priorities.length +
            filterState.statuses.length +
            filterState.types.length +
            filterState.assignedTo.length +
            filterState.evidenceCoverage.length +
            filterState.slaRisks.length +
            filterState.linkedRemovalCaseIds.length +
            filterState.linkedSupportRequestIds.length +
            (filterState.onlyUnassigned ? 1 : 0) +
            (filterState.onlyEscalated ? 1 : 0),
    };
}
export function getSupportQueueFilterSummary(filterState) {
    return {
        hasActiveFilters: Boolean(filterState.query) || filterState.priorities.length > 0 || filterState.requestTypes.length > 0 || filterState.statuses.length > 0 || filterState.assignedTo.length > 0 || filterState.slaRisks.length > 0,
        activeFilterCount: (filterState.query ? 1 : 0) + filterState.priorities.length + filterState.requestTypes.length + filterState.statuses.length + filterState.assignedTo.length + filterState.slaRisks.length,
    };
}
