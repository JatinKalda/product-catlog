# Product Catalog API

A production-ready REST API for browsing 200,000+ products with **cursor (keyset) pagination** that guarantees no duplicate or missing results, even while the catalog is being updated in real-time.

**Stack:** Node.js · TypeScript · Express · PostgreSQL · Prisma

---

## Quick Start

```bash
# 1. Configure environment
cp .env.example .env         # edit DATABASE_URL if needed

# 2. Start with Docker (simplest)
docker compose up -d

# 3. Run migrations
docker compose exec api npx prisma migrate deploy

# 4. Seed 200,000 products (~30–45s)
docker compose exec api npm run seed

# 5. Test it
curl http://localhost:3000/health
curl http://localhost:3000/products?limit=20
```

Without Docker:
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev        # hot-reload dev server on :3000
npm run seed       # in a separate terminal
```

---

## Project Structure

```
src/
├── index.ts                  # App bootstrap, middleware, graceful shutdown
├── config.ts                 # Env-var config — single source of truth
├── logger.ts                 # Winston structured logger
├── types.ts                  # Shared TypeScript interfaces
├── routes/
│   ├── products.ts           # HTTP handlers (thin — parse, call service, return)
│   └── health.ts             # Liveness probe with real DB check
├── services/
│   └── productService.ts     # All business logic, orchestrates Prisma queries
├── middleware/
│   └── errorHandler.ts       # Global error handler, AppError class
└── utils/
    ├── cursor.ts             # Cursor encode/decode, keyset WHERE clause builder
    └── validation.ts         # Request body validation
prisma/
└── schema.prisma             # DB schema + index definitions
tests/
├── setup.ts                  # Env vars for test runs
├── cursor.test.ts            # Unit tests — no DB needed
├── validation.test.ts        # Unit tests — no DB needed
└── products.test.ts          # Route tests with mocked service
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Liveness probe (checks DB too) |
| `GET` | `/products` | Paginated product list |
| `GET` | `/products/:id` | Single product |
| `POST` | `/products` | Create product |
| `PUT` | `/products/:id` | Partial update |
| `DELETE` | `/products/:id` | Delete product |

### List Products

```
GET /products?limit=20
GET /products?limit=20&category=Shoes
GET /products?limit=20&cursor=<token_from_previous_response>
```

**Response:**
```json
{
  "items": [
    {
      "id": 150000,
      "name": "Ergonomic Steel Chair",
      "category": "Furniture",
      "price": 299.99,
      "createdAt": "2024-03-01T08:00:00.000Z",
      "updatedAt": "2024-05-01T12:00:00.000Z"
    }
  ],
  "nextCursor": "eyJ1cGRhdGVkQXQiOiIyMDI0LTA1LTAxVDEyOjAwOjAwWiIsImlkIjoxNTAwMDB9",
  "hasMore": true,
  "count": 20
}
```

Pass `nextCursor` as `?cursor=` on the next request. When `hasMore` is `false`, you've reached the last page.

---

## Why Cursor Pagination?

### The OFFSET problem

```sql
-- Gets slower the deeper you go
SELECT * FROM products ORDER BY updated_at DESC LIMIT 20 OFFSET 99980;
-- PostgreSQL scans and discards 99,980 rows before returning 20
```

More critically, concurrent writes break pagination:

```
User is on page 50. New product inserted at the top.
All rows shift down by 1.
User moves to page 51 → sees the last row of page 50 again (duplicate).
Or a deletion causes them to skip a row entirely (gap).
```

### How cursor pagination fixes it

```sql
-- Always O(log n) — uses the composite index to seek directly
SELECT * FROM products
WHERE (updated_at < '2024-05-01T12:00:00Z')
   OR (updated_at = '2024-05-01T12:00:00Z' AND id < 150000)
ORDER BY updated_at DESC, id DESC
LIMIT 20;
```

- **No duplicates:** the keyset condition (`<`) mathematically excludes all rows already seen
- **No gaps:** new inserts go to the top of the list — rows already fetched never shift
- **O(log n) at any depth:** the index seek is the same cost at page 1 as at page 10,000

### Cursor format

The cursor encodes `(updatedAt, id)` as a base64 JSON blob. It's opaque to clients — they treat it as a black box string.

---

## Database Schema

```sql
CREATE TABLE products (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(255)   NOT NULL,
  category   VARCHAR(100)   NOT NULL,
  price      DECIMAL(10,2)  NOT NULL,
  created_at TIMESTAMPTZ    NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ    NOT NULL DEFAULT now()
);
```

### Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_products_updated_id` | `(updated_at DESC, id DESC)` | O(log n) cursor pagination without category |
| `idx_products_category_updated_id` | `(category, updated_at DESC, id DESC)` | O(log n) pagination with `?category=` |
| `idx_products_created_at` | `(created_at DESC)` | Analytics / time-range queries |
| `idx_products_name` | `(name)` | Search support (upgradeable to GIN/tsvector) |

---

## Running Tests

```bash
npm test              # all tests (no DB required — service is mocked)
npm run test:watch    # watch mode during development
```

Tests cover:
- Cursor encode/decode round-trips
- Limit clamping and validation
- Request body validation (name, category, price rules)
- All HTTP routes (200/201/204/400/404 cases)
- Health endpoint with DB up/down scenarios

---

## Deployment (Render + Neon)

1. **Create a Neon PostgreSQL** database at [neon.tech](https://neon.tech). Copy the connection string.

2. **Create a Render Web Service:**
   - Runtime: Docker
   - Root directory: `/`
   - The `CMD` in the Dockerfile runs `prisma migrate deploy` before starting — tables are created automatically

3. **Set environment variables on Render:**
   ```
   DATABASE_URL=postgresql://user:pass@ep-xxx.region.neon.tech/neondb?sslmode=require
   NODE_ENV=production
   LOG_LEVEL=info
   ```

4. **Seed the database** (run once from local pointing at Neon):
   ```bash
   DATABASE_URL=<neon_url> npm run seed
   ```

---

## Performance

| Operation | Index | Complexity |
|-----------|-------|-----------|
| First page (no cursor) | `idx_products_updated_id` | O(log n) |
| Any subsequent page | `idx_products_updated_id` | O(log n) |
| Filtered by category | `idx_products_category_updated_id` | O(log n) |
| Single product by ID | Primary key | O(log n) |

At 200,000 rows, `log₂(200,000) ≈ 17` comparisons to locate any page.

---

## Future Improvements

- **Full-text search** via PostgreSQL `tsvector` + GIN index on `name`
- **Rate limiting** with `express-rate-limit`
- **Redis caching** for the first page (most requested, no cursor needed)
- **Soft deletes** — `deleted_at` timestamp instead of hard delete
- **Swagger/OpenAPI** docs via `swagger-ui-express`
- **Prisma pagination cursor** — Prisma has a native cursor API; currently bypassed to use raw keyset SQL for correctness with compound sort keys
