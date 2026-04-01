import { type ClassValue } from 'clsx';
export declare function cn(...inputs: ClassValue[]): string;
export declare const alexandriaTokens: {
    readonly colors: {
        readonly primary: "#094cb2";
        readonly tertiary: "#6d5e00";
        readonly surfaceCanvas: "#f8f5ef";
        readonly surfaceLevel1: "#f1ece2";
        readonly surfaceLevel2: "#e8e1d3";
        readonly surfaceLevel3: "#ddd3c0";
        readonly surfaceDim: "#d3c6ae";
    };
    readonly typography: {
        readonly heading: "Noto Serif";
        readonly body: "Inter";
        readonly label: "Public Sans";
    };
    readonly effects: {
        readonly modalBlur: "20px";
        readonly modalOpacity: 0.8;
    };
};
export { Badge, Button, Card, FieldGroup, Input, Modal, StatusBadge, Stepper } from './components';
export { AuditRetentionPanel, EvidenceSnapshotCard, FeatureCard, IntakeErrorPanel, RbacAuditHintCard, RbacScopeBadge, RemovalCaseFlowCard, RemovalCaseRow, ReviewDecisionCard, ReviewOutcomeActionCard, ReviewOutcomeActionList, ReviewOutcomeActionPanel, ReviewOutcomeGuidanceCard, ReviewSummaryCard, SearchEvidenceCard, SearchResultCard, SupportQueueRow, ValidationIssueList } from './trustshield-feature';
