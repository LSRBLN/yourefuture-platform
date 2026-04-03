import type { Config } from 'tailwindcss';

const config: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: '#094cb2',
        'primary-container': '#3b78d1',
        tertiary: '#6d5e00',
        background: '#f5f1e8',
        foreground: '#1c2430',
        'muted-foreground': '#5f6773',
        'surface-canvas': '#f8f5ef',
        'surface-level-1': '#f1ece2',
        'surface-level-2': '#e8e1d3',
        'surface-level-3': '#ddd3c0',
        'surface-dim': '#d3c6ae',
        'outline-ghost': 'rgb(28 36 48 / 0.15)',
      },
      borderRadius: {
        sm: '0.5rem',
        md: '0.875rem',
        lg: '1.5rem',
        xl: '2rem',
      },
      boxShadow: {
        soft: '0 24px 40px rgb(28 36 48 / 0.06)',
        glass: '0 24px 40px rgb(28 36 48 / 0.05)',
      },
      backdropBlur: {
        glass: '20px',
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(135deg, #094cb2 0%, #3b78d1 100%)',
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'Noto Serif', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
        label: ['var(--font-label)', 'Public Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
