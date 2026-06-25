/**
 * Application configuration
 * Centralises all env-var access so nothing reads process.env directly elsewhere.
 * Throws at startup if a required variable is missing — fail fast, not at request time.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

const config = {
  server: {
    port: parseInt(process.env.PORT ?? '3000', 10),
    env: process.env.NODE_ENV ?? 'development',
    isDev: (process.env.NODE_ENV ?? 'development') === 'development',
  },
  database: {
    url: requireEnv('DATABASE_URL'),
  },
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  log: {
    level: process.env.LOG_LEVEL ?? 'info',
  },
} as const;

export default config;
