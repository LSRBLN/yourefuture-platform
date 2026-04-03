import assert from 'node:assert/strict';
import test from 'node:test';

import {
  mockChecks,
  mockContentMatches,
  mockRemovalCases,
  mockReviewQueue,
  mockSources,
  mockSupportQueue,
  mockSupportRequests,
  mockUnifiedSearchRecords,
} from './trustshield-mocks.js';
import {
  getRemovalFilterSummary,
  selectOutcomeActionStates,
  getReviewQueueFilterSummary,
  getSearchFilterSummary,
  getSupportQueueFilterSummary,
  matchesReviewQueueFilter,
  matchesSearchFilter,
  selectRemovalCases,
  selectReviewQueueItems,
  selectSearchRecords,
  selectSupportQueueItems,
} from './trustshield-selectors.js';
import {
  defaultRemovalFilterState,
  defaultReviewQueueFilterState,
  defaultSearchFilterState,
  defaultSupportQueueFilterState,
  validateCheckRecord,
  validateContentMatchRecord,
  validateRemovalCaseRecord,
  validateReviewQueueItem,
  validateSourceRecord,
  validateSupportRequestRecord,
} from './trustshield-records.js';

test('selectSearchRecords filtert Eskalationen und blendet missing evidence aus', () => {
  const selected = selectSearchRecords(mockUnifiedSearchRecords, {
    ...defaultSearchFilterState,
    onlyEscalated: true,
    includeSensitive: false,
  });

  assert.equal(selected.length, 0);
  assert.equal(matchesSearchFilter(mockUnifiedSearchRecords[2], { ...defaultSearchFilterState, onlyEscalated: true, includeSensitive: true }), true);
});

test('selectSearchRecords sortiert nach Score absteigend', () => {
  const selected = selectSearchRecords(mockUnifiedSearchRecords, defaultSearchFilterState);

  assert.deepEqual(
    selected.map((record: { id: string }) => record.id),
    ['SR-4401', 'SR-4402', 'SR-4403'],
  );
});

test('selectRemovalCases filtert nach Status und Plattform', () => {
  const selected = selectRemovalCases(mockRemovalCases, {
    ...defaultRemovalFilterState,
    statuses: ['followup_required'],
    platforms: ['Archivmirror'],
  });

  assert.deepEqual(selected.map((record: { id: string }) => record.id), ['RM-1877']);
});

test('selectSupportQueueItems sortiert Prioritäten absteigend', () => {
  const selected = selectSupportQueueItems(mockSupportQueue, {
    ...defaultSupportQueueFilterState,
    sort: { field: 'priority', direction: 'desc' },
  });

  assert.deepEqual(selected.map((item: { id: string }) => item.id), ['US-9921', 'US-8842', 'US-6451', 'US-7610']);
});

test('selectReviewQueueItems filtert nach Verknüpfung, Assignment und Eskalation', () => {
  const selected = selectReviewQueueItems(mockReviewQueue, {
    ...defaultReviewQueueFilterState,
    linkedSupportRequestIds: ['US-6451'],
    onlyEscalated: true,
  });

  assert.deepEqual(selected.map((item: { id: string }) => item.id), ['RV-2999']);
  assert.equal(
    matchesReviewQueueFilter(mockReviewQueue[1], {
      ...defaultReviewQueueFilterState,
      onlyUnassigned: true,
    }),
    false,
  );
});

test('selectOutcomeActionStates mappt blocked, in_progress und ready aus Review-Outcomes', () => {
  const states = selectOutcomeActionStates(mockReviewQueue, ['action_recommended', 'insufficient_evidence', 'removal_recommended']);

  assert.deepEqual(states, {
    action_recommended: {
      status: 'blocked',
      label: 'Wartet auf Outcome',
      hint: 'Noch kein Review-Objekt mit passender finalDecision in der aktuellen Queue-Auswahl.',
    },
    insufficient_evidence: {
      status: 'blocked',
      label: 'Wartet auf Outcome',
      hint: 'Noch kein Review-Objekt mit passender finalDecision in der aktuellen Queue-Auswahl.',
    },
    removal_recommended: {
      status: 'in_progress',
      label: 'Aktion ausführbar',
      hint: 'Outcome ist vorhanden; operativer Folgepfad kann unmittelbar ausgeführt werden.',
    },
  });
});

test('Filter-Summaries zählen aktive Filter korrekt', () => {
  assert.deepEqual(getSearchFilterSummary({ ...defaultSearchFilterState, query: 'whitepages', onlyEscalated: true }), {
    hasActiveFilters: true,
    activeFilterCount: 2,
  });
  assert.deepEqual(getRemovalFilterSummary({ ...defaultRemovalFilterState, statuses: ['submitted'], platforms: ['Spokeo'] }), {
    hasActiveFilters: true,
    activeFilterCount: 2,
  });
  assert.deepEqual(getReviewQueueFilterSummary({ ...defaultReviewQueueFilterState, statuses: ['assigned'], onlyEscalated: true }), {
    hasActiveFilters: true,
    activeFilterCount: 2,
  });
  assert.deepEqual(getSupportQueueFilterSummary({ ...defaultSupportQueueFilterState, statuses: ['assigned'], requestTypes: ['support'] }), {
    hasActiveFilters: true,
    activeFilterCount: 2,
  });
});

test('Validator-nahe Helper akzeptieren konsistente Kern-Datensätze', () => {
  assert.equal(validateCheckRecord(mockChecks[0]).valid, true);
  assert.equal(validateSourceRecord(mockSources[0]).valid, true);
  assert.equal(validateContentMatchRecord(mockContentMatches[0]).valid, true);
  assert.equal(validateReviewQueueItem(mockReviewQueue[0]).valid, true);
  assert.equal(validateRemovalCaseRecord(mockRemovalCases[0]).valid, true);
  assert.equal(validateSupportRequestRecord(mockSupportRequests[0]).valid, true);
});

test('Validator-nahe Helper melden fachliche Fehler', () => {
  const invalidCheck = validateCheckRecord({
    ...mockChecks[0],
    type: 'image',
    input: {},
    primaryAssetId: undefined,
  });
  const invalidReview = validateReviewQueueItem({
    ...mockReviewQueue[0],
    linkedCheckId: undefined,
    linkedAssetId: undefined,
    linkedMatchId: undefined,
    linkedRemovalCaseId: undefined,
    linkedSupportRequestId: undefined,
  });
  const invalidRemoval = validateRemovalCaseRecord({
    ...mockRemovalCases[0],
    targetUrl: 'ftp://invalid',
    actions: [],
  });

  assert.equal(invalidCheck.valid, false);
  assert.equal(invalidReview.valid, false);
  assert.equal(invalidRemoval.valid, false);
});
