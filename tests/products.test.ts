/**
 * Route-level tests using a mocked ProductService.
 * No real DB needed — tests the HTTP layer in isolation.
 */

import request from 'supertest';
import express from 'express';
import { createProductRouter } from '../src/routes/products';
import { createHealthRouter } from '../src/routes/health';
import { errorHandler } from '../src/middleware/errorHandler';
import { ProductService } from '../src/services/productService';

// ── Mock the service ──────────────────────────────────────────────────────────
const mockService = {
  getProducts:    jest.fn(),
  getProductById: jest.fn(),
  createProduct:  jest.fn(),
  updateProduct:  jest.fn(),
  deleteProduct:  jest.fn(),
  ping:           jest.fn().mockResolvedValue(true),
} as unknown as ProductService;

// ── Build a minimal test app ──────────────────────────────────────────────────
function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/health',   createHealthRouter(mockService));
  app.use('/products', createProductRouter(mockService));
  app.use(errorHandler);
  return app;
}

const app = buildApp();

// ── Helpers ───────────────────────────────────────────────────────────────────
const sampleProduct = {
  id: 1, name: 'Test Shoe', category: 'Shoes', price: 99.99,
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};

const sampleList = {
  items: [sampleProduct], nextCursor: null, hasMore: false, count: 1,
};

beforeEach(() => jest.clearAllMocks());

// ── Health ────────────────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 when DB is reachable', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('returns 503 when DB is unreachable', async () => {
    (mockService.ping as jest.Mock).mockResolvedValueOnce(false);
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body.database).toBe('unreachable');
  });
});

// ── GET /products ─────────────────────────────────────────────────────────────
describe('GET /products', () => {
  it('returns 200 with paginated list', async () => {
    (mockService.getProducts as jest.Mock).mockResolvedValue(sampleList);
    const res = await request(app).get('/products');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.nextCursor).toBeNull();
  });

  it('passes limit and category to service', async () => {
    (mockService.getProducts as jest.Mock).mockResolvedValue(sampleList);
    await request(app).get('/products?limit=5&category=Shoes');
    expect(mockService.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 5, category: 'Shoes' }),
    );
  });

  it('returns 400 on invalid cursor', async () => {
    (mockService.getProducts as jest.Mock).mockRejectedValue(new Error('Invalid cursor format'));
    const res = await request(app).get('/products?cursor=bad');
    expect(res.status).toBe(400);
  });
});

// ── GET /products/:id ─────────────────────────────────────────────────────────
describe('GET /products/:id', () => {
  it('returns 200 with the product', async () => {
    (mockService.getProductById as jest.Mock).mockResolvedValue(sampleProduct);
    const res = await request(app).get('/products/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it('returns 404 when not found', async () => {
    (mockService.getProductById as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/products/999');
    expect(res.status).toBe(404);
  });

  it('returns 400 for non-numeric id', async () => {
    const res = await request(app).get('/products/abc');
    expect(res.status).toBe(400);
  });
});

// ── POST /products ────────────────────────────────────────────────────────────
describe('POST /products', () => {
  it('returns 201 with created product', async () => {
    (mockService.createProduct as jest.Mock).mockResolvedValue(sampleProduct);
    const res = await request(app)
      .post('/products')
      .send({ name: 'Air Max', category: 'Shoes', price: 99.99 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Shoe');
  });

  it('returns 400 on missing price', async () => {
    const res = await request(app).post('/products').send({ name: 'X', category: 'Y' });
    expect(res.status).toBe(400);
  });

  it('returns 400 on price = 0', async () => {
    const res = await request(app).post('/products').send({ name: 'X', category: 'Y', price: 0 });
    expect(res.status).toBe(400);
  });
});

// ── PUT /products/:id ─────────────────────────────────────────────────────────
describe('PUT /products/:id', () => {
  it('returns 200 with updated product', async () => {
    (mockService.updateProduct as jest.Mock).mockResolvedValue({ ...sampleProduct, price: 49.99 });
    const res = await request(app).put('/products/1').send({ price: 49.99 });
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(49.99);
  });

  it('returns 404 when not found', async () => {
    (mockService.updateProduct as jest.Mock).mockResolvedValue(null);
    const res = await request(app).put('/products/999').send({ price: 10 });
    expect(res.status).toBe(404);
  });

  it('returns 400 when body is empty', async () => {
    const res = await request(app).put('/products/1').send({});
    expect(res.status).toBe(400);
  });
});

// ── DELETE /products/:id ──────────────────────────────────────────────────────
describe('DELETE /products/:id', () => {
  it('returns 204 on success', async () => {
    (mockService.deleteProduct as jest.Mock).mockResolvedValue(true);
    const res = await request(app).delete('/products/1');
    expect(res.status).toBe(204);
  });

  it('returns 404 when not found', async () => {
    (mockService.deleteProduct as jest.Mock).mockResolvedValue(false);
    const res = await request(app).delete('/products/999');
    expect(res.status).toBe(404);
  });
});
