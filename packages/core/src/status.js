export const statusToneClassNames = {
    neutral: 'bg-[#eceff2] text-slate-600',
    info: 'bg-[#eef3fb] text-[#094cb2]',
    success: 'bg-[#e9f3ec] text-[#1f6b45]',
    warning: 'bg-[#f3efe7] text-[#6d5e00]',
    danger: 'bg-[#f8e8e7] text-[#a0362f]',
};
export const reviewPriorityBadgeMap = {
    low: { label: 'low', tone: 'neutral' },
    medium: { label: 'medium', tone: 'warning' },
    high: { label: 'high', tone: 'danger' },
    urgent: { label: 'urgent', tone: 'danger' },
};
export const supportStatusBadgeMap = {
    open: { label: 'open', tone: 'info' },
    triaged: { label: 'triaged', tone: 'warning' },
    assigned: { label: 'assigned', tone: 'success' },
    in_progress: { label: 'in progress', tone: 'info' },
    waiting_user: { label: 'waiting user', tone: 'warning' },
    escalated: { label: 'escalated', tone: 'danger' },
    resolved: { label: 'resolved', tone: 'success' },
    closed: { label: 'closed', tone: 'neutral' },
};
export const reviewStatusBadgeMap = {
    open: { label: 'open', tone: 'info' },
    triaged: { label: 'triaged', tone: 'warning' },
    assigned: { label: 'assigned', tone: 'success' },
    in_review: { label: 'in review', tone: 'info' },
    waiting_more_context: { label: 'waiting context', tone: 'warning' },
    decided: { label: 'decided', tone: 'success' },
    escalated: { label: 'escalated', tone: 'danger' },
    closed: { label: 'closed', tone: 'neutral' },
};
export const removalStatusBadgeMap = {
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
export const evidenceCoverageBadgeMap = {
    complete: { label: 'evidence complete', tone: 'success' },
    partial: { label: 'evidence partial', tone: 'warning' },
    missing: { label: 'evidence missing', tone: 'danger' },
};
export const slaRiskBadgeMap = {
    healthy: { label: 'sla healthy', tone: 'success' },
    watch: { label: 'sla watch', tone: 'warning' },
    risk: { label: 'sla risk', tone: 'danger' },
    breach: { label: 'sla breach', tone: 'danger' },
};
export const supportRequestTypeLabels = {
    support: 'Support',
    removal: 'Removal',
    upload_review: 'Upload Review',
    identity_review: 'Identity Review',
};
export const severityTextClassNames = {
    low: 'text-stone-500',
    medium: 'text-[#6d5e00]',
    high: 'text-[#a0362f]',
    critical: 'text-[#7a130d]',
};
