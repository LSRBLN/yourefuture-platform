import type { Config } from 'tailwindcss';
import sharedConfig from '@trustshield/ui/tailwind.config';

const config: Config = {
  presets: [sharedConfig],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/ui/globals.css',
  ],
};

export default config;
