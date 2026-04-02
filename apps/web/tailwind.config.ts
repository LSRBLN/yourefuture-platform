import type { Config } from 'tailwindcss';
import sharedConfig from '@trustshield/ui/tailwind.config';

const config: Config = {
  presets: [sharedConfig],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/ui/globals.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Noto Serif', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Primary brand blue
        primary: '#3b82f6',
        'primary-dark': '#1d4ed8',
        'primary-container': '#1e3a5f',
        // Status colors
        success: '#22c55e',
        'success-dim': '#16a34a',
        warning: '#f59e0b',
        danger: '#ef4444',
        'danger-dim': '#b91c1c',
        // Dark theme surfaces
        background: '#0d0f14',
        surface: '#0d0f14',
        'surface-dim': '#090b0f',
        'surface-bright': '#181b23',
        'surface-container-lowest': '#0a0c11',
        'surface-container-low': '#111318',
        'surface-container': '#161820',
        'surface-container-high': '#1c1f29',
        'surface-container-highest': '#242836',
        // Sidebar specific
        'sidebar-bg': '#0f1117',
        'sidebar-item-active': '#1a2035',
        'sidebar-item-hover': '#161820',
        // Text
        'on-surface': '#e8eaf0',
        'on-surface-variant': '#8b90a0',
        'on-surface-muted': '#5a5f70',
        outline: '#2d3244',
        'outline-variant': '#1e2235',
        'error-container': '#3b0f0f',
        // Badge colors
        'badge-high': '#450a0a',
        'badge-pending': '#451a03',
        'badge-verified': '#052e16',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '20px',
        xl: '40px',
      },
      borderRadius: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '28px',
      },
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12)',
        'elevation-2': '0px 3px 5px -1px rgba(0, 0, 0, 0.2), 0px 6px 10px 0px rgba(0, 0, 0, 0.14), 0px 1px 18px 0px rgba(0, 0, 0, 0.12)',
        'elevation-3': '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
        'elevation-modal': '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 40px 5px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)',
      },
    },
  },
};

export default config;
