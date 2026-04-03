import * as React from 'react';
import { type EvidenceSnapshot, type RemovalCaseRecord, type ReviewQueueItem, type SupportQueueItem, type UnifiedSearchRecord } from '@trustshield/core';
export declare function FeatureCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): import("react/jsx-runtime").JSX.Element;
type ReviewOutcomeActionCardProps = {
    outcome: string;
    actionLabel: string;
    rbacScope: string;
    auditEvent: string;
    retention: string;
    rbacLabel?: string;
    auditLabel?: string;
    emphasis?: 'default' | 'warning' | 'critical';
    className?: string;
    badgeClassName?: string;
};
type RemovalCaseFlowCardProps = {
    item: RemovalCaseRecord;
    className?: string;
};
type IntakeErrorPanelProps = {
    title: string;
    summary: string;
    items: Array<{
        label: string;
        detail: string;
    }>;
    className?: string;
};
type ValidationIssueListProps = {
    issues: Array<{
        path?: string;
        message: string;
    }>;
    className?: string;
    itemClassName?: string;
    pathClassName?: string;
    emptyLabel?: string;
};
type RbacAuditHintCardProps = {
    title: string;
    description?: string;
    rbacLabel?: string;
    rbacScope: string;
    auditLabel?: string;
    auditEvent: string;
    retention: string;
    emphasis?: 'default' | 'warning' | 'critical';
    className?: string;
    panelClassName?: string;
};
type ReviewOutcomeActionListProps = {
    items: ReviewOutcomeActionCardProps[];
    className?: string;
    itemClassName?: string;
    badgeClassNames?: string[];
};
type ReviewOutcomeActionPanelProps = {
    title: string;
    description: string;
    items: ReviewOutcomeActionCardProps[];
    className?: string;
    listClassName?: string;
    itemClassName?: string;
    badgeClassNames?: string[];
};
type ReviewOutcomeGuidanceCardProps = {
    title: string;
    items: string[];
    className?: string;
};
type RbacScopeBadgeProps = {
    label: string;
    scope: string;
    emphasis?: 'default' | 'warning' | 'critical';
    className?: string;
};
type AuditRetentionPanelProps = {
    label: string;
    auditEvent: string;
    retention: string;
    className?: string;
};
export declare function EvidenceSnapshotCard({ snapshot, className }: {
    snapshot: EvidenceSnapshot;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function RbacScopeBadge({ label, scope, emphasis, className }: RbacScopeBadgeProps): import("react/jsx-runtime").JSX.Element;
export declare function AuditRetentionPanel({ label, auditEvent, retention, className }: AuditRetentionPanelProps): import("react/jsx-runtime").JSX.Element;
export declare function ReviewOutcomeActionCard({ outcome, actionLabel, rbacScope, auditEvent, retention, rbacLabel, auditLabel, emphasis, className, badgeClassName }: ReviewOutcomeActionCardProps): import("react/jsx-runtime").JSX.Element;
export declare function RemovalCaseFlowCard({ item, className }: RemovalCaseFlowCardProps): import("react/jsx-runtime").JSX.Element;
export declare function IntakeErrorPanel({ title, summary, items, className }: IntakeErrorPanelProps): import("react/jsx-runtime").JSX.Element;
export declare function ValidationIssueList({ issues, className, itemClassName, pathClassName, emptyLabel }: ValidationIssueListProps): import("react/jsx-runtime").JSX.Element;
export declare function RbacAuditHintCard({ title, description, rbacLabel, rbacScope, auditLabel, auditEvent, retention, emphasis, className, panelClassName }: RbacAuditHintCardProps): import("react/jsx-runtime").JSX.Element;
export declare function ReviewSummaryCard({ item, className }: {
    item: ReviewQueueItem;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function SupportQueueRow({ item }: {
    item: SupportQueueItem;
}): import("react/jsx-runtime").JSX.Element;
export declare function RemovalCaseRow({ item }: {
    item: RemovalCaseRecord;
}): import("react/jsx-runtime").JSX.Element;
export declare function SearchEvidenceCard({ record, className }: {
    record: UnifiedSearchRecord;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function SearchResultCard({ record, className }: {
    record: UnifiedSearchRecord;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function ReviewDecisionCard({ item, className }: {
    item: ReviewQueueItem;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export declare function ReviewOutcomeActionList({ items, className, itemClassName, badgeClassNames }: ReviewOutcomeActionListProps): import("react/jsx-runtime").JSX.Element;
export declare function ReviewOutcomeActionPanel({ title, description, items, className, listClassName, itemClassName, badgeClassNames }: ReviewOutcomeActionPanelProps): import("react/jsx-runtime").JSX.Element;
export declare function ReviewOutcomeGuidanceCard({ title, items, className }: ReviewOutcomeGuidanceCardProps): import("react/jsx-runtime").JSX.Element;
export {};
