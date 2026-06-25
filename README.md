# Product Catalog

This project contains a full-stack product catalog application, including a backend API and a frontend client.

**Stack:**
- **Backend:** Node.js · TypeScript · Express · PostgreSQL · Prisma
- **Frontend:** React · TypeScript · Vite · TailwindCSS

---

## Project Structure

The project is structured as a monorepo with two main packages:

```
/
├── backend/          # Node.js REST API
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── ...
└── frontend/
    └── product-catalog/      # React client
        ├── src/
        ├── package.json
        └── ...
```

---

## Backend Quick Start

All backend commands should be run from the `backend` directory.

```bash
cd backend
```

### With Docker (Simplest)

```bash
# 1. Configure environment
cp .env.example .env         # edit DATABASE_URL if needed

# 2. Start services
docker compose up -d

# 3. Run migrations
docker compose exec api npx prisma migrate deploy

# 4. Seed 200,000 products (~30–45s)
docker compose exec api npm run seed

# 5. Test it
curl http://localhost:3000/health
curl http://localhost:3000/products?limit=20
```

### Without Docker

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run migrations
npx prisma migrate dev

# 4. Start the dev server
npm run dev        # hot-reload dev server on :3000

# 5. Seed the database (in a separate terminal)
npm run seed
```

---

## Frontend Quick Start

All frontend commands should be run from the `frontend/product-catalog` directory.

```bash
cd frontend/product-catalog
```

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev # App will be running at http://localhost:5173
```

---
## API Endpoints, Database Schema, etc.

For more detailed information about the backend API, including endpoints, database schema, and design decisions, please see the original `README.md` file, which has been moved to `backend/README.md`.
