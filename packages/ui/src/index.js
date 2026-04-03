import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
export const alexandriaTokens = {
    colors: {
        primary: '#094cb2',
        tertiary: '#6d5e00',
        surfaceCanvas: '#f8f5ef',
        surfaceLevel1: '#f1ece2',
        surfaceLevel2: '#e8e1d3',
        surfaceLevel3: '#ddd3c0',
        surfaceDim: '#d3c6ae',
    },
    typography: {
        heading: 'Noto Serif',
        body: 'Inter',
        label: 'Public Sans',
    },
    effects: {
        modalBlur: '20px',
        modalOpacity: 0.8,
    },
};
export { Badge, Button, Card, FieldGroup, Input, Modal, StatusBadge, Stepper } from './components';
export { AuditRetentionPanel, EvidenceSnapshotCard, FeatureCard, IntakeErrorPanel, RbacAuditHintCard, RbacScopeBadge, RemovalCaseFlowCard, RemovalCaseRow, ReviewDecisionCard, ReviewOutcomeActionCard, ReviewOutcomeActionList, ReviewOutcomeActionPanel, ReviewOutcomeGuidanceCard, ReviewSummaryCard, SearchEvidenceCard, SearchResultCard, SupportQueueRow, ValidationIssueList } from './trustshield-feature';
