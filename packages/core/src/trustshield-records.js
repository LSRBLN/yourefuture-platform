function pushIssue(issues, field, message) {
    issues.push({ field, message });
}
export function validateCheckRecord(record) {
    const issues = [];
    if (!record.id.trim()) {
        pushIssue(issues, 'id', 'Check benötigt eine ID.');
    }
    if (record.type === 'leak_email' && !record.input.email) {
        pushIssue(issues, 'input.email', 'Für leak_email ist eine E-Mail erforderlich.');
    }
    if (record.type === 'leak_username' && !record.input.username) {
        pushIssue(issues, 'input.username', 'Für leak_username ist ein Username erforderlich.');
    }
    if (record.type === 'leak_phone' && !record.input.phone) {
        pushIssue(issues, 'input.phone', 'Für leak_phone ist eine Telefonnummer erforderlich.');
    }
    if (record.type === 'leak_domain' && !record.input.domain) {
        pushIssue(issues, 'input.domain', 'Für leak_domain ist eine Domain erforderlich.');
    }
    if (record.type === 'password_hash' && !record.input.passwordHashPrefix) {
        pushIssue(issues, 'input.passwordHashPrefix', 'Für password_hash ist ein Hash-Präfix erforderlich.');
    }
    if ((record.type === 'image' || record.type === 'video') && !record.input.assetId && !record.primaryAssetId) {
        pushIssue(issues, 'input.assetId', 'Für bild- oder videobasierte Checks ist ein Asset erforderlich.');
    }
    if (record.risk.score !== undefined && (record.risk.score < 0 || record.risk.score > 100)) {
        pushIssue(issues, 'risk.score', 'Risk-Score muss zwischen 0 und 100 liegen.');
    }
    return { valid: issues.length === 0, issues };
}
export function validateSourceRecord(record) {
    const issues = [];
    if (!record.sourceUrl.startsWith('http://') && !record.sourceUrl.startsWith('https://')) {
        pushIssue(issues, 'sourceUrl', 'Source-URL muss mit http:// oder https:// beginnen.');
    }
    if (!record.assetId && !record.checkId) {
        pushIssue(issues, 'assetId', 'Quelle muss mindestens mit Asset oder Check verknüpft sein.');
    }
    return { valid: issues.length === 0, issues };
}
export function validateContentMatchRecord(record) {
    const issues = [];
    if (!record.assetId && !record.checkId && !record.sourceId) {
        pushIssue(issues, 'assetId', 'Match muss auf Asset, Check oder Source referenzieren.');
    }
    if (record.confidence !== undefined && (record.confidence < 0 || record.confidence > 1)) {
        pushIssue(issues, 'confidence', 'Confidence muss zwischen 0 und 1 liegen.');
    }
    return { valid: issues.length === 0, issues };
}
export function validateReviewQueueItem(item) {
    const issues = [];
    if (!item.linkedCheckId && !item.linkedAssetId && !item.linkedMatchId && !item.linkedRemovalCaseId && !item.linkedSupportRequestId) {
        pushIssue(issues, 'linkedCheckId', 'Review-Item benötigt mindestens eine fachliche Verknüpfung.');
    }
    if (item.status === 'decided' && !item.finalDecision) {
        pushIssue(issues, 'finalDecision', 'Entschiedene Reviews benötigen ein Final Decision Outcome.');
    }
    return { valid: issues.length === 0, issues };
}
export function validateRemovalCaseRecord(record) {
    const issues = [];
    if (!record.targetUrl.startsWith('http://') && !record.targetUrl.startsWith('https://')) {
        pushIssue(issues, 'targetUrl', 'Removal Target URL muss mit http:// oder https:// beginnen.');
    }
    if ((record.status === 'submitted' || record.status === 'under_review') && record.actions.length === 0) {
        pushIssue(issues, 'actions', 'Submitted/under_review Removal Cases benötigen mindestens eine dokumentierte Action.');
    }
    return { valid: issues.length === 0, issues };
}
export function validateSupportRequestRecord(record) {
    const issues = [];
    if (!record.message.trim()) {
        pushIssue(issues, 'message', 'Support-Anfrage benötigt eine Nachricht.');
    }
    if (!record.checkId && !record.assetId && !record.removalCaseId) {
        pushIssue(issues, 'checkId', 'Support-Anfrage sollte mit Check, Asset oder Removal Case verknüpft sein.');
    }
    return { valid: issues.length === 0, issues };
}
export const defaultSupportQueueFilterState = {
    query: '',
    priorities: [],
    requestTypes: [],
    statuses: [],
    assignedTo: [],
    slaRisks: [],
    sort: { field: 'updatedAt', direction: 'desc' },
};
export const defaultReviewQueueFilterState = {
    query: '',
    priorities: [],
    statuses: [],
    types: [],
    assignedTo: [],
    evidenceCoverage: [],
    slaRisks: [],
    linkedRemovalCaseIds: [],
    linkedSupportRequestIds: [],
    onlyUnassigned: false,
    onlyEscalated: false,
    sort: { field: 'priority', direction: 'desc' },
};
export const defaultRemovalFilterState = {
    query: '',
    statuses: [],
    severities: [],
    evidenceCoverage: [],
    slaRisks: [],
    platforms: [],
    sort: { field: 'updatedAt', direction: 'desc' },
};
export const defaultSearchFilterState = {
    query: '',
    statuses: [],
    reviewPriorities: [],
    evidenceCoverage: [],
    platforms: [],
    assignedTo: [],
    onlyEscalated: false,
    includeSensitive: true,
    sort: { field: 'score', direction: 'desc' },
};
