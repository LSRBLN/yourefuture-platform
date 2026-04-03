import { type EnvSchema, envSchema } from './env.schema.js';

function formatPath(path: Array<string | number>): string {
  return path.length === 0 ? 'root' : path.join('.');
}

export function validateEnv(rawEnv: Record<string, unknown>): EnvSchema {
  const parsedEnv = envSchema.safeParse(rawEnv);

  if (parsedEnv.success) {
    return parsedEnv.data;
  }

  const details = parsedEnv.error.issues
    .map((issue: { path: Array<string | number>; message: string }) => `- ${formatPath(issue.path)}: ${issue.message}`)
    .join('\n');

  throw new Error(`Ungültige Environment-Konfiguration:\n${details}`);
}
