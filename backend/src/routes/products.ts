/**
 * Product routes — HTTP boundary only.
 * Parse params, call service, return response. No business logic here.
 */

import { Router, Request, Response } from 'express';
import { ProductService } from '../services/productService';
import { validateCreateProduct, validateUpdateProduct } from '../utils/validation';
import { validateLimit } from '../utils/cursor';
import logger from '../logger';

export function createProductRouter(productService: ProductService): Router {
  const router = Router();

  /**
   * GET /products
   * Cursor-paginated product list. Filters by category when ?category= is set.
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const result = await productService.getProducts({
        limit:    validateLimit(req.query.limit as string | undefined),
        cursor:   req.query.cursor   as string | undefined,
        category: req.query.category as string | undefined,
      });
      res.status(200).json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch products';
      // Invalid cursor is a client error → 400
      const status = message.includes('cursor') ? 400 : 500;
      logger.warn('GET /products error', { message });
      res.status(status).json({ error: message });
    }
  });

  /**
   * GET /products/:id
   */
  router.get('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
    try {
      const product = await productService.getProductById(id);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.status(200).json(product);
    } catch (err) {
      logger.error('GET /products/:id error', { id, err });
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  });

  /**
   * POST /products
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const data    = validateCreateProduct(req.body);
      const product = await productService.createProduct(data);
      res.status(201).json(product);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create product';
      res.status(400).json({ error: message });
    }
  });

  /**
   * PUT /products/:id
   */
  router.put('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
    try {
      const data    = validateUpdateProduct(req.body);
      const product = await productService.updateProduct(id, data);
      if (!product) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.status(200).json(product);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update product';
      res.status(400).json({ error: message });
    }
  });

  /**
   * DELETE /products/:id
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id < 1) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }
    try {
      const deleted = await productService.deleteProduct(id);
      if (!deleted) {
        res.status(404).json({ error: 'Product not found' });
        return;
      }
      res.status(204).send();
    } catch (err) {
      logger.error('DELETE /products/:id error', { id, err });
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  return router;
}
