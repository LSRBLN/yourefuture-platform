import * as React from 'react';
import { type StatusBadgeDefinition, type WorkflowStatusTone } from '@trustshield/core';
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
};
export declare function Button({ className, variant, type, ...props }: ButtonProps): import("react/jsx-runtime").JSX.Element;
type CardProps = React.HTMLAttributes<HTMLDivElement> & {
    tone?: 'canvas' | 'muted' | 'elevated';
};
export declare function Card({ className, tone, ...props }: CardProps): import("react/jsx-runtime").JSX.Element;
export declare const Input: React.ForwardRefExoticComponent<React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>>;
export declare function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>): import("react/jsx-runtime").JSX.Element;
type StatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
    tone?: WorkflowStatusTone;
    definition?: StatusBadgeDefinition;
};
export declare function StatusBadge({ className, tone, definition, children, ...props }: StatusBadgeProps): import("react/jsx-runtime").JSX.Element;
type FieldGroupProps = React.HTMLAttributes<HTMLDivElement> & {
    label?: React.ReactNode;
    hint?: React.ReactNode;
    aside?: React.ReactNode;
};
export declare function FieldGroup({ className, label, hint, aside, children, ...props }: FieldGroupProps): import("react/jsx-runtime").JSX.Element;
type StepperItem = {
    label: string;
    description?: string;
    state?: 'complete' | 'current' | 'upcoming';
};
type StepperProps = React.HTMLAttributes<HTMLOListElement> & {
    items: StepperItem[];
};
export declare function Stepper({ className, items, ...props }: StepperProps): import("react/jsx-runtime").JSX.Element;
type ModalProps = React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
};
export declare function Modal({ className, open, ...props }: ModalProps): import("react/jsx-runtime").JSX.Element | null;
export {};
