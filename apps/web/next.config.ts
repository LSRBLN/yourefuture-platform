import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createNextIntlPlugin from 'next-intl/plugin';

import type { NextConfig } from 'next';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.config.ts');

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(dirname, '../..'),
  transpilePackages: ['@trustshield/ui', '@trustshield/core'],
};

export default withNextIntl(nextConfig);
