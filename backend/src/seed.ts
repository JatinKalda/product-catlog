/**
 * Database seed script
 *
 * Inserts 200,000 products using batch inserts (Prisma createMany).
 *
 * Efficiency:
 * - createMany() compiles to a single multi-row INSERT per batch
 * - 200,000 rows / 5,000 rows per batch = 40 round-trips to the DB (not 200,000)
 * - Faker data generated in-memory before each batch insert
 * - Expected runtime: 20–45 seconds on a local PostgreSQL instance
 *
 * Usage:
 *   ts-node src/seed.ts          — inserts 200,000 products (clears existing first)
 *   TOTAL=1000 ts-node src/seed.ts   — custom count for testing
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import logger from './logger';

const prisma = new PrismaClient();

const CATEGORIES = [
  'Electronics', 'Clothing', 'Shoes', 'Books',
  'Home & Garden', 'Sports', 'Beauty', 'Toys',
  'Food', 'Furniture', 'Jewelry', 'Automotive',
];

const BATCH_SIZE   = 5_000;
const TOTAL        = parseInt(process.env.TOTAL ?? '200000', 10);

function generateProduct() {
  return {
    name:      faker.commerce.productName(),
    category:  faker.helpers.arrayElement(CATEGORIES),
    price:     parseFloat(faker.commerce.price({ min: 1, max: 10_000, dec: 2 })),
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent({ days: 30 }),
  };
}

async function seed(): Promise<void> {
  logger.info('Starting seed …', { total: TOTAL, batchSize: BATCH_SIZE });
  const start = Date.now();

  const deleted = await prisma.product.deleteMany();
  logger.info('Cleared existing rows', { count: deleted.count });

  const batches = Math.ceil(TOTAL / BATCH_SIZE);
  for (let i = 0; i < batches; i++) {
    const batchSize = Math.min(BATCH_SIZE, TOTAL - i * BATCH_SIZE);
    const data = Array.from({ length: batchSize }, generateProduct);

    await prisma.product.createMany({ data, skipDuplicates: false });

    const done = Math.min((i + 1) * BATCH_SIZE, TOTAL);
    logger.info(`Progress: ${done}/${TOTAL} (${Math.round((done / TOTAL) * 100)}%)`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  logger.info(`Seed complete in ${elapsed}s`, { total: TOTAL });
}

seed()
  .catch((err) => { logger.error('Seed failed', { err }); process.exit(1); })
  .finally(() => prisma.$disconnect());
