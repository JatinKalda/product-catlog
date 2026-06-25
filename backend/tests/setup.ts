// Set required environment variables before any module under test imports config.ts
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost:5432/test';
process.env.NODE_ENV     = 'test';
process.env.LOG_LEVEL    = 'silent'; // suppress all logs during tests
