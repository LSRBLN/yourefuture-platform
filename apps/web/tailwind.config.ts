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
        primary: '#094cb2',
        'primary-container': '#d4e4ff',
        secondary: '#575d71',
        tertiary: '#6d5e00',
        'tertiary-container': '#ffe08c',
        background: '#fffbfe',
        surface: '#fffbfe',
        'surface-dim': '#ded8e1',
        'surface-bright': '#fffbfe',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f7f2fa',
        'surface-container': '#f3edf7',
        'surface-container-high': '#ede7f1',
        'surface-container-highest': '#e8e1eb',
        'on-surface': '#1c1b1f',
        'on-surface-variant': '#49454e',
        outline: '#79747e',
        'outline-variant': '#cac4d0',
        'error-container': '#f9dedc',
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
