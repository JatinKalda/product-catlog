/**
 * Shared type definitions
 */

/** Position markers encoded into every pagination cursor */
export interface CursorPayload {
  updatedAt: string; // ISO 8601 UTC string
  id: number;
}

/** Opaque, base64-encoded cursor string transmitted in query params */
export type EncodedCursor = string;

/** Paginated product list */
export interface ProductListResponse {
  items: ProductDTO[];
  nextCursor: EncodedCursor | null;
  hasMore: boolean;
  count: number;
}

/** Product shape returned to API callers */
export interface ProductDTO {
  id: number;
  name: string;
  category: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

/** Body for POST /products */
export interface CreateProductDTO {
  name: string;
  category: string;
  price: number;
}

/** Body for PUT /products/:id — all fields optional */
export interface UpdateProductDTO {
  name?: string;
  category?: string;
  price?: number;
}

/** Query params for GET /products */
export interface PaginationParams {
  limit: number;
  cursor?: EncodedCursor;
  category?: string;
}
