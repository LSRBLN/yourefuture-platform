import * as React from 'react';
import { evidenceCoverageBadgeMap, removalStatusBadgeMap, reviewPriorityBadgeMap, reviewStatusBadgeMap, severityTextClassNames, slaRiskBadgeMap, supportRequestTypeLabels, supportStatusBadgeMap, type EvidenceSnapshot, type RemovalCaseRecord, type ReviewQueueItem, type SupportQueueItem, type UnifiedSearchRecord } from '@trustshield/core';
import { StatusBadge } from './components';
import { cn } from './index';

export function FeatureCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('rounded-[1.5rem] bg-white/85 p-4', className)} {...props} />; }

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
  items: Array<{ label: string; detail: string }>;
  className?: string;
};

type ValidationIssueListProps = {
  issues: Array<{ path?: string; message: string }>;
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

const rbacToneClassNames: Record<NonNullable<RbacScopeBadgeProps['emphasis']>, string> = {
  default: 'bg-[#eef3fb] text-[#094cb2]',
  warning: 'bg-[#f6ede9] text-[#8a4b22]',
  critical: 'bg-[#fbefee] text-[#a0362f]',
};

export function EvidenceSnapshotCard({ snapshot, className }: { snapshot: EvidenceSnapshot; className?: string }) {
  return <FeatureCard className={cn('space-y-3', className)}><div className="flex flex-wrap items-center gap-2"><StatusBadge definition={evidenceCoverageBadgeMap[snapshot.coverage]} /><span className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{snapshot.snapshotType}</span></div><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{snapshot.summary}</p><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{snapshot.retentionNote}</p></FeatureCard>;
}

export function RbacScopeBadge({ label, scope, emphasis = 'default', className }: RbacScopeBadgeProps) {
  return <div className={cn('rounded-[1.25rem] p-4', rbacToneClassNames[emphasis], className)}><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em]">{label}</p><p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6">{scope}</p></div>;
}

export function AuditRetentionPanel({ label, auditEvent, retention, className }: AuditRetentionPanelProps) {
  return <div className={cn('rounded-[1.25rem] bg-white/85 p-4', className)}><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{label}</p><p className="mt-2 font-[family-name:var(--font-heading)] text-sm text-stone-950">{auditEvent}</p><p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{retention}</p></div>;
}

export function ReviewOutcomeActionCard({ outcome, actionLabel, rbacScope, auditEvent, retention, rbacLabel = 'RBAC-Scope', auditLabel = 'Audit & Retention', emphasis = 'default', className, badgeClassName }: ReviewOutcomeActionCardProps) {
  return <FeatureCard className={cn('space-y-4 bg-[#f8f5ef]', className)}><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div className="space-y-2"><p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{actionLabel}</p><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">Outcome: {outcome}</p></div><span className={cn('inline-flex items-center rounded-full px-3 py-1 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.16em]', badgeClassName ?? 'bg-[#eef3fb] text-[#094cb2]')}>{auditEvent}</span></div><div className="grid gap-3 lg:grid-cols-2"><RbacScopeBadge label={rbacLabel} scope={rbacScope} emphasis={emphasis} /><AuditRetentionPanel label={auditLabel} auditEvent={auditEvent} retention={retention} /></div></FeatureCard>;
}

export function RemovalCaseFlowCard({ item, className }: RemovalCaseFlowCardProps) {
  return <FeatureCard className={cn('space-y-4 bg-white', className)}><div className="flex flex-wrap items-center gap-2"><span className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{item.id}</span><StatusBadge definition={removalStatusBadgeMap[item.status]} /><StatusBadge definition={evidenceCoverageBadgeMap[item.evidenceCoverage]} /><StatusBadge definition={slaRiskBadgeMap[item.slaRisk]} /></div><div className="space-y-2"><p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{item.platform}</p><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{item.nextActionLabel}</p></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-[1.25rem] bg-[#f8f5ef] p-4"><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Zuständigkeit</p><p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{item.assignedTo ?? 'Nicht zugewiesen'}</p></div><div className="rounded-[1.25rem] bg-[#f8f5ef] p-4"><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Retention</p><p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{item.evidenceSnapshot.retentionNote}</p></div></div></FeatureCard>;
}

export function IntakeErrorPanel({ title, summary, items, className }: IntakeErrorPanelProps) {
  return <FeatureCard className={cn('space-y-4 bg-[#fbefee]', className)}><div className="space-y-2"><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-[#a0362f]">Fehlerpfad</p><p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{title}</p><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{summary}</p></div><div className="space-y-3">{items.map((item) => <div key={item.label} className="rounded-[1.25rem] bg-white/80 p-4"><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{item.label}</p><p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{item.detail}</p></div>)}</div></FeatureCard>;
}

export function ValidationIssueList({ issues, className, itemClassName, pathClassName, emptyLabel = 'Keine Fehler erkannt' }: ValidationIssueListProps) {
  if (issues.length === 0) {
    return <p className={cn('font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600', className)}>{emptyLabel}</p>;
  }

  return <ul className={cn('space-y-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700', className)}>{issues.map((issue, index) => <li key={`${issue.path ?? 'root'}:${issue.message}:${index}`} className={itemClassName}><span className={cn('font-semibold text-stone-900', pathClassName)}>{issue.path || 'root'}</span>{' · '}{issue.message}</li>)}</ul>;
}

export function RbacAuditHintCard({ title, description, rbacLabel = 'RBAC-Scope', rbacScope, auditLabel = 'Audit & Retention', auditEvent, retention, emphasis = 'default', className, panelClassName }: RbacAuditHintCardProps) {
  return <FeatureCard className={cn('space-y-4 bg-[#f8f5ef]', className)}><div className="space-y-2"><p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{title}</p>{description ? <p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{description}</p> : null}</div><div className={cn('grid gap-3 lg:grid-cols-2', panelClassName)}><RbacScopeBadge label={rbacLabel} scope={rbacScope} emphasis={emphasis} /><AuditRetentionPanel label={auditLabel} auditEvent={auditEvent} retention={retention} /></div></FeatureCard>;
}

export function ReviewSummaryCard({ item, className }: { item: ReviewQueueItem; className?: string }) {
  return <FeatureCard className={cn('space-y-3 bg-[#f8f5ef]', className)}><div className="flex flex-wrap items-center gap-2"><span className="font-[family-name:var(--font-label)] text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{item.id}</span><StatusBadge definition={reviewPriorityBadgeMap[item.priority]} /><StatusBadge definition={reviewStatusBadgeMap[item.status]} /><StatusBadge definition={evidenceCoverageBadgeMap[item.evidenceSnapshot.coverage]} /></div><p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{item.summary}</p><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{item.recommendedAction}</p><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{item.evidenceSnapshot.summary}</p></FeatureCard>;
}

export function SupportQueueRow({ item }: { item: SupportQueueItem }) {
  return <tr className="align-top"><td className="px-4 py-4"><div className="rounded-[1.5rem] bg-white p-4"><div className="flex flex-wrap items-center gap-3"><span className="font-[family-name:var(--font-label)] text-sm font-semibold tracking-[0.08em] text-[#094cb2]">#{item.id}</span><span className="font-[family-name:var(--font-body)] text-sm text-stone-600">{item.updatedAt}</span></div><p className="mt-3 font-[family-name:var(--font-heading)] text-lg text-stone-950">{item.requesterLabel}</p><p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{item.note}</p></div></td><td className="px-4 py-4"><StatusBadge definition={reviewPriorityBadgeMap[item.priority]} /></td><td className="px-4 py-4 font-[family-name:var(--font-body)] text-sm text-stone-700">{supportRequestTypeLabels[item.requestType]}</td><td className="px-4 py-4"><div className="flex flex-wrap gap-2"><StatusBadge definition={supportStatusBadgeMap[item.status]} /><StatusBadge definition={slaRiskBadgeMap[item.slaRisk]} /><StatusBadge definition={evidenceCoverageBadgeMap[item.evidenceCoverage]} /></div></td><td className="px-4 py-4"><div className="space-y-3 rounded-[1.5rem] bg-[#f1ece2] p-4"><p className="font-[family-name:var(--font-body)] text-sm text-stone-700">{item.assignedTo}</p><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{item.slaDueAt}</p><button className="font-[family-name:var(--font-label)] text-xs font-semibold uppercase tracking-[0.18em] text-[#094cb2] underline-offset-4 hover:underline">Fall öffnen</button></div></td></tr>;
}

export function RemovalCaseRow({ item }: { item: RemovalCaseRecord }) {
  return <div className="grid gap-4 rounded-[1.75rem] bg-[#f8f5ef] p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(12rem,0.8fr)]"><div className="space-y-3"><div className="flex flex-wrap items-center gap-3"><span className="font-[family-name:var(--font-label)] text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{item.id}</span><span className={cn('font-[family-name:var(--font-label)] text-xs font-semibold uppercase tracking-[0.18em]', severityTextClassNames[item.severity])}>{item.severity} severity</span></div><h3 className="font-[family-name:var(--font-heading)] text-2xl text-stone-950">{item.platform}</h3><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-[#094cb2] underline decoration-[#094cb2]/30 underline-offset-4">{item.targetUrl}</p></div><div className="space-y-3"><div className="flex flex-wrap gap-2"><StatusBadge definition={removalStatusBadgeMap[item.status]} /><StatusBadge definition={evidenceCoverageBadgeMap[item.evidenceCoverage]} /><StatusBadge definition={slaRiskBadgeMap[item.slaRisk]} /><StatusBadge definition={reviewStatusBadgeMap[item.reviewStatus]} /></div><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">Letztes Update: {item.lastUpdateAt}</p></div><div className="rounded-[1.5rem] bg-white p-4"><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Nächste Aktion</p><p className="mt-3 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{item.nextActionLabel}</p><button className="mt-4 font-[family-name:var(--font-label)] text-xs font-semibold uppercase tracking-[0.18em] text-[#094cb2] underline-offset-4 hover:underline">Falldetails öffnen</button></div></div>;
}

export function SearchEvidenceCard({ record, className }: { record: UnifiedSearchRecord; className?: string }) {
  return <FeatureCard className={cn('space-y-2', className)}><div className="flex flex-wrap items-center gap-2"><span className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{record.id}</span><StatusBadge definition={evidenceCoverageBadgeMap[record.evidenceCoverage]} /><StatusBadge definition={reviewStatusBadgeMap[record.reviewStatus]} /></div><p className="font-[family-name:var(--font-heading)] text-base text-stone-950">{record.title}</p><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{record.evidenceSnapshot.summary}</p></FeatureCard>;
}

export function SearchResultCard({ record, className }: { record: UnifiedSearchRecord; className?: string }) {
  return <FeatureCard className={cn('space-y-4 bg-[#f8f5ef]', className)}><div className="flex flex-wrap items-center gap-2"><span className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{record.platform}</span><StatusBadge definition={reviewPriorityBadgeMap[record.reviewPriority]} /><StatusBadge definition={reviewStatusBadgeMap[record.reviewStatus]} /><StatusBadge definition={evidenceCoverageBadgeMap[record.evidenceCoverage]} /></div><div className="space-y-2"><p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{record.title}</p><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{record.summary}</p></div><div className="rounded-[1.25rem] bg-white/90 p-4"><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">Nächste Aktion</p><p className="mt-2 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{record.nextActionLabel}</p></div></FeatureCard>;
}

export function ReviewDecisionCard({ item, className }: { item: ReviewQueueItem; className?: string }) {
  return <FeatureCard className={cn('space-y-4 bg-white', className)}><div className="flex flex-wrap items-center gap-2"><span className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{item.id}</span><StatusBadge definition={reviewPriorityBadgeMap[item.priority]} /><StatusBadge definition={reviewStatusBadgeMap[item.status]} /></div><div className="space-y-2"><p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{item.summary}</p><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{item.recommendedAction}</p></div><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{item.evidenceSnapshot.retentionNote}</p></FeatureCard>;
}

export function ReviewOutcomeActionList({ items, className, itemClassName, badgeClassNames }: ReviewOutcomeActionListProps) {
  return <div className={cn('space-y-3', className)}>{items.map((item, index) => <ReviewOutcomeActionCard key={item.auditEvent} {...item} className={cn(item.className, itemClassName)} badgeClassName={item.badgeClassName ?? badgeClassNames?.[index % badgeClassNames.length]} />)}</div>;
}

export function ReviewOutcomeActionPanel({ title, description, items, className, listClassName, itemClassName, badgeClassNames }: ReviewOutcomeActionPanelProps) {
  return <FeatureCard className={cn('space-y-5 bg-white/85', className)}><div className="space-y-2"><p className="font-[family-name:var(--font-heading)] text-lg text-stone-950">{title}</p><p className="font-[family-name:var(--font-body)] text-sm leading-6 text-stone-600">{description}</p></div><ReviewOutcomeActionList items={items} className={listClassName} itemClassName={itemClassName} badgeClassNames={badgeClassNames} /></FeatureCard>;
}

export function ReviewOutcomeGuidanceCard({ title, items, className }: ReviewOutcomeGuidanceCardProps) {
  return <FeatureCard className={cn('space-y-4 bg-white/85', className)}><p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.18em] text-stone-500">{title}</p><ul className="space-y-1 font-[family-name:var(--font-body)] text-sm leading-6 text-stone-700">{items.map((item) => <li key={item}>{item}</li>)}</ul></FeatureCard>;
}
