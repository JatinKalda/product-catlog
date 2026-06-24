# Product Catalog Frontend

A production-ready React frontend for the Product Catalog API.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** — fast dev server & build tool
- **TailwindCSS** — utility-first styling
- **React Router v6** — client-side routing
- **TanStack Query v5** — server state, caching, infinite scroll
- **Axios** — HTTP client
- **React Hook Form** — form management & validation
- **React Hot Toast** — toast notifications
- **Lucide React** — icons

## Prerequisites

- Node.js 18+ 
- Backend running at `http://localhost:3000`

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000` | Backend API base URL |

## Features

- **Dashboard** — Browse all products in a responsive grid
- **Search** — Real-time client-side search by product name
- **Category Filter** — Filter products by category via API
- **Cursor Pagination** — Load More button using `nextCursor`
- **Product Details** — Full detail view for each product
- **Add Product** — Modal form with validation (POST)
- **Edit Product** — Pre-filled modal form (PUT)
- **Delete Product** — Confirmation dialog (DELETE)
- **Loading Skeletons** — Skeleton cards while fetching
- **Error Handling** — Toast notifications + retry buttons
- **Responsive** — Works on mobile, tablet, and desktop

## Project Structure

```
src/
├── api/           # Axios client instance
├── components/
│   ├── layout/    # Navbar, Footer
│   ├── product/   # ProductCard, ProductGrid, LoadMore, ProductFormModal
│   └── ui/        # SearchBar, CategoryFilter, DeleteModal, LoadingSkeleton
├── hooks/         # useProducts (TanStack Query hooks)
├── layouts/       # MainLayout
├── pages/         # Dashboard, ProductDetails, NotFound
├── services/      # productsService (API calls)
├── types/         # TypeScript interfaces
└── utils/         # formatPrice, formatDate, filterProducts, etc.
```

## Build for Production

```bash
npm run build
npm run preview
```

## API Endpoints Used

| Method | Endpoint | Usage |
|--------|----------|-------|
| GET | `/health` | Health check |
| GET | `/products?limit=20` | Load products |
| GET | `/products?cursor=<cursor>` | Load more (pagination) |
| GET | `/products?category=<cat>` | Filter by category |
| GET | `/products/:id` | Product details |
| POST | `/products` | Create product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |
