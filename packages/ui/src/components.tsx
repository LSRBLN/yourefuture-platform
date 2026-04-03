import * as React from 'react';
import { statusToneClassNames, type StatusBadgeDefinition, type WorkflowStatusTone } from '@trustshield/core';
import { cn } from './index';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-5 py-3 font-[family-name:var(--font-label)] text-sm font-semibold tracking-[0.14em] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#094cb2]/30 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-[#094cb2] text-white shadow-[0_16px_32px_rgba(9,76,178,0.16)] hover:bg-[#083f94]',
        variant === 'secondary' && 'bg-[#e8e1d3] text-[#1c2430] hover:bg-[#ddd3c0]',
        variant === 'ghost' && 'bg-transparent text-[#49515c] hover:bg-white/70',
        className,
      )}
      {...props}
    />
  );
}

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: 'canvas' | 'muted' | 'elevated';
};

export function Card({ className, tone = 'canvas', ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[2rem] p-6 sm:p-8',
        tone === 'canvas' && 'bg-white shadow-[0_24px_60px_rgba(28,36,48,0.06)]',
        tone === 'muted' && 'bg-[#f1ece2]',
        tone === 'elevated' && 'bg-[#e8e1d3]',
        className,
      )}
      {...props}
    />
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full rounded-2xl bg-[#f8f5ef] px-4 py-3 font-[family-name:var(--font-body)] text-sm text-[#1c2430] placeholder:text-[#7a8088] outline-none transition focus:bg-white focus:ring-2 focus:ring-[#094cb2]/20',
          className,
        )}
        {...props}
      />
    );
  },
);

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-[#e8eefb] px-3 py-1 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#094cb2]',
        className,
      )}
      {...props}
    />
  );
}

type StatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: WorkflowStatusTone;
  definition?: StatusBadgeDefinition;
};

export function StatusBadge({ className, tone = 'neutral', definition, children, ...props }: StatusBadgeProps) {
  const resolvedTone = definition?.tone ?? tone;
  const resolvedLabel = definition?.label ?? children;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.18em]',
        statusToneClassNames[resolvedTone],
        className,
      )}
      {...props}
    >
      {resolvedLabel}
    </span>
  );
}

type FieldGroupProps = React.HTMLAttributes<HTMLDivElement> & {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  aside?: React.ReactNode;
};

export function FieldGroup({ className, label, hint, aside, children, ...props }: FieldGroupProps) {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {label || aside ? (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {label ? (
              <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">
                {label}
              </p>
            ) : null}
            {hint ? (
              <p className="font-[family-name:var(--font-body)] text-xs leading-5 text-stone-500">{hint}</p>
            ) : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

type StepperItem = {
  label: string;
  description?: string;
  state?: 'complete' | 'current' | 'upcoming';
};

type StepperProps = React.HTMLAttributes<HTMLOListElement> & {
  items: StepperItem[];
};

export function Stepper({ className, items, ...props }: StepperProps) {
  return (
    <ol className={cn('grid gap-3 sm:grid-cols-3', className)} {...props}>
      {items.map((item, index) => {
        const state = item.state ?? 'upcoming';

        return (
          <li
            key={item.label}
            className={cn(
              'rounded-[1.5rem] px-4 py-4',
              state === 'complete' && 'bg-[#e8eefb]',
              state === 'current' && 'bg-white shadow-[0_18px_36px_rgba(28,36,48,0.06)]',
              state === 'upcoming' && 'bg-[#f1ece2]',
            )}
          >
            <div className="space-y-2">
              <p className="font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Schritt {index + 1}
              </p>
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full font-[family-name:var(--font-label)] text-[11px] font-semibold uppercase tracking-[0.08em]',
                    state === 'complete' && 'bg-[#094cb2] text-white',
                    state === 'current' && 'bg-[#eef3fb] text-[#094cb2]',
                    state === 'upcoming' && 'bg-white/80 text-stone-600',
                  )}
                >
                  {state === 'complete' ? '✓' : index + 1}
                </span>
                <div className="space-y-1">
                  <p className="font-[family-name:var(--font-heading)] text-base leading-6 text-stone-900">{item.label}</p>
                  {item.description ? (
                    <p className="font-[family-name:var(--font-body)] text-xs leading-5 text-stone-600">{item.description}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

type ModalProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean;
};

export function Modal({ className, open = true, ...props }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        'rounded-[2rem] bg-white/80 p-5 shadow-[0_24px_50px_rgba(28,36,48,0.08)] backdrop-blur-[20px]',
        className,
      )}
      {...props}
    />
  );
}
