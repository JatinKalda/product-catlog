/**
 * Health check endpoint
 * Used by load balancers, Render, and monitoring tools.
 * Returns 200 when healthy, 503 when the database is unreachable.
 */

import { Router, Request, Response } from 'express';
import { ProductService } from '../services/productService';
import config from '../config';

export function createHealthRouter(productService: ProductService): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    const dbOk = await productService.ping();

    const status = {
      status:    dbOk ? 'healthy' : 'degraded',
      database:  dbOk ? 'connected' : 'unreachable',
      version:   config.server.env,
      timestamp: new Date().toISOString(),
    };

    res.status(dbOk ? 200 : 503).json(status);
  });

  return router;
}
