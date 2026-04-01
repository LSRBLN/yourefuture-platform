import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { statusToneClassNames } from '@trustshield/core';
import { cn } from './index';
export function Button({ className, variant = 'primary', type = 'button', ...props }) {
    return (_jsx("button", { type: type, className: cn('inline-flex items-center justify-center rounded-2xl px-5 py-3 font-[family-name:var(--font-label)] text-sm font-semibold tracking-[0.14em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#094cb2]/30 disabled:cursor-not-allowed disabled:opacity-50', variant === 'primary' && 'bg-[#094cb2] text-white shadow-[0_16px_32px_rgba(9,76,178,0.16)] hover:bg-[#083f94]', variant === 'secondary' && 'bg-[#e8e1d3] text-[#1c2430] hover:bg-[#ddd3c0]', variant === 'ghost' && 'bg-transparent text-[#49515c] hover:bg-white/70', className), ...props }));
}
export function Card({ className, tone = 'canvas', ...props }) {
    return (_jsx("div", { className: cn('rounded-[2rem] p-6 sm:p-8', tone === 'canvas' && 'bg-white shadow-[0_24px_60px_rgba(28,36,48,0.06)]', tone === 'muted' && 'bg-[#f1ece2]', tone === 'elevated' && 'bg-[#e8e1d3]', className), ...props }));
}
export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
    return (_jsx("input", { ref: ref, className: cn('w-full rounded-2xl bg-[#f8f5ef] px-4 py-3 font-[family-name:var(--font-body)] text-sm text-[#1c2430] placeholder:text-[#7a8088] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#094cb2]/20', className), ...props }));
});
export function Badge({ className, ...props }) {
    return (_jsx("span", { className: cn('inline-flex items-center rounded-full bg-[#e8eefb] px-3 py-1 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#094cb2]', className), ...props }));
}
export function StatusBadge({ className, tone = 'neutral', definition, children, ...props }) {
    const resolvedTone = definition?.tone ?? tone;
    const resolvedLabel = definition?.label ?? children;
    return (_jsx("span", { className: cn('inline-flex items-center rounded-full px-3 py-1 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.18em]', statusToneClassNames[resolvedTone], className), ...props, children: resolvedLabel }));
}
export function FieldGroup({ className, label, hint, aside, children, ...props }) {
    return (_jsxs("div", { className: cn('space-y-3', className), ...props, children: [label || aside ? (_jsxs("div", { className: "flex items-start justify-between gap-4", children: [_jsxs("div", { className: "space-y-1", children: [label ? (_jsx("p", { className: "font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500", children: label })) : null, hint ? (_jsx("p", { className: "font-[family-name:var(--font-body)] text-xs leading-5 text-stone-500", children: hint })) : null] }), aside ? _jsx("div", { className: "shrink-0", children: aside }) : null] })) : null, children] }));
}
export function Stepper({ className, items, ...props }) {
    return (_jsx("ol", { className: cn('grid gap-3 sm:grid-cols-3', className), ...props, children: items.map((item, index) => {
            const state = item.state ?? 'upcoming';
            return (_jsx("li", { className: cn('rounded-[1.5rem] px-4 py-4', state === 'complete' && 'bg-[#e8eefb]', state === 'current' && 'bg-white shadow-[0_18px_36px_rgba(28,36,48,0.06)]', state === 'upcoming' && 'bg-[#f1ece2]'), children: _jsxs("div", { className: "space-y-2", children: [_jsxs("p", { className: "font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500", children: ["Schritt ", index + 1] }), _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("span", { className: cn('mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.08em]', state === 'complete' && 'bg-[#094cb2] text-white', state === 'current' && 'bg-[#eef3fb] text-[#094cb2]', state === 'upcoming' && 'bg-white/80 text-stone-600'), children: state === 'complete' ? '✓' : index + 1 }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "font-[family-name:var(--font-heading)] text-base leading-6 text-stone-900", children: item.label }), item.description ? (_jsx("p", { className: "font-[family-name:var(--font-body)] text-xs leading-5 text-stone-600", children: item.description })) : null] })] })] }) }, item.label));
        }) }));
}
export function Modal({ className, open = true, ...props }) {
    if (!open) {
        return null;
    }
    return (_jsx("div", { className: cn('rounded-[2rem] bg-white/80 p-5 shadow-[0_24px_50px_rgba(28,36,48,0.08)] backdrop-blur-[20px]', className), ...props }));
}
