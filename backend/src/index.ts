/**
 * Application entry point.
 * Bootstraps Express, registers middleware and routes, starts the server.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

import config from './config';
import logger from './logger';
import { createHealthRouter } from './routes/health';
import { createProductRouter } from './routes/products';
import { ProductService } from './services/productService';
import { errorHandler } from './middleware/errorHandler';

// ── Prisma ─────────────────────────────────────────────────────────────────────
const prisma = new PrismaClient({
  log: config.server.isDev ? ['warn', 'error'] : ['error'],
});

// ── Service layer ──────────────────────────────────────────────────────────────
const productService = new ProductService(prisma);

// ── Express app ────────────────────────────────────────────────────────────────
const app = express();

// Security & utility middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: (msg: string) => logger.info(msg.trim()) },
    // Silence health-check noise in production
    skip: (req) => req.path === '/health' && !config.server.isDev,
  }),
);

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/health',   createHealthRouter(productService));  // fixed: passes service
app.use('/products', createProductRouter(productService));

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler — must be last
app.use(errorHandler);

// ── Startup ────────────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  // Verify DB is reachable before accepting traffic
  const dbOk = await productService.ping();
  if (!dbOk) {
    logger.error('Cannot reach database — check DATABASE_URL');
    process.exit(1);
  }

  const { port, env } = config.server;
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`, { env });
    logger.info(`Docs: http://localhost:${port}/health`);
  });
}

// ── Graceful shutdown ──────────────────────────────────────────────────────────
async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received — shutting down gracefully`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT',  () => void shutdown('SIGINT'));

// Only start when executed directly (not when imported by tests)
if (require.main === module) {
  start().catch((err) => {
    logger.error('Startup failed', { err });
    process.exit(1);
  });
}

export { app, productService };
