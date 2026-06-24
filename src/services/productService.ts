/**
 * Product service — all business logic lives here.
 *
 * Design rules:
 * - No HTTP concepts (no Request / Response).
 * - Returns plain objects; route handlers convert to JSON.
 * - Uses try/catch around Prisma calls that can throw P2025 (record not found).
 */

import { PrismaClient } from '@prisma/client';
import {
  ProductDTO,
  ProductListResponse,
  CreateProductDTO,
  UpdateProductDTO,
  PaginationParams,
  EncodedCursor,
} from '../types';
import { encodeCursor, decodeCursor, validateLimit, buildCursorWhereClause } from '../utils/cursor';
import logger from '../logger';

/** Fields selected on every product query — avoids SELECT * */
const PRODUCT_SELECT = {
  id: true,
  name: true,
  category: true,
  price: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class ProductService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Return a page of products using keyset (cursor) pagination.
   *
   * Algorithm:
   * 1. Build WHERE clause from cursor (if present) and optional category filter.
   * 2. Fetch limit + 1 rows to detect whether a next page exists.
   * 3. If we got limit + 1 rows → hasMore = true; slice to limit.
   * 4. Encode a cursor from the last item in the page.
   */
  async getProducts(params: PaginationParams): Promise<ProductListResponse> {
    const limit = validateLimit(params.limit);

    // Start with an empty where clause; add conditions progressively.
    const where: Record<string, unknown> = {};

    if (params.category) {
      where.category = params.category;
    }

    if (params.cursor) {
      const decoded = decodeCursor(params.cursor); // throws on invalid cursor
      const cursorClause = buildCursorWhereClause(decoded);

      // Merge cursor clause with any existing category filter via AND.
      if (where.category) {
        where.AND = [cursorClause, { category: where.category }];
        delete where.category;
      } else {
        Object.assign(where, cursorClause);
      }
    }

    const rows = await this.prisma.product.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
      take: limit + 1, // fetch one extra to detect next page
      select: PRODUCT_SELECT,
    });

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;

    let nextCursor: EncodedCursor | null = null;
    if (hasMore && items.length > 0) {
      const last = items[items.length - 1];
      nextCursor = encodeCursor({
        updatedAt: last.updatedAt.toISOString(),
        id: Number(last.id),
      });
    }

    logger.debug('getProducts', { limit, hasMore, count: items.length, category: params.category });

    return {
      items: items.map(this.toDTO),
      nextCursor,
      hasMore,
      count: items.length,
    };
  }

  /** Fetch a single product or return null. */
  async getProductById(id: number): Promise<ProductDTO | null> {
    const product = await this.prisma.product.findUnique({
      where: { id: BigInt(id) },
      select: PRODUCT_SELECT,
    });
    return product ? this.toDTO(product) : null;
  }

  /** Create a new product. */
  async createProduct(data: CreateProductDTO): Promise<ProductDTO> {
    const product = await this.prisma.product.create({
      data: { name: data.name, category: data.category, price: data.price },
      select: PRODUCT_SELECT,
    });
    logger.info('Product created', { id: Number(product.id) });
    return this.toDTO(product);
  }

  /**
   * Partially update a product.
   * Returns null when the product does not exist (Prisma P2025).
   *
   * Bug fix from original: used `data.name && ...` which silently skipped
   * falsy-but-valid values. Now we check `!== undefined` explicitly.
   */
  async updateProduct(id: number, data: UpdateProductDTO): Promise<ProductDTO | null> {
    try {
      const product = await this.prisma.product.update({
        where: { id: BigInt(id) },
        data: {
          ...(data.name      !== undefined && { name: data.name }),
          ...(data.category  !== undefined && { category: data.category }),
          ...(data.price     !== undefined && { price: data.price }),
        },
        select: PRODUCT_SELECT,
      });
      logger.info('Product updated', { id: Number(product.id) });
      return this.toDTO(product);
    } catch (err: unknown) {
      // P2025 = record not found
      if (isPrismaNotFound(err)) return null;
      throw err;
    }
  }

  /** Delete a product. Returns false when the product does not exist. */
  async deleteProduct(id: number): Promise<boolean> {
    try {
      await this.prisma.product.delete({ where: { id: BigInt(id) } });
      logger.info('Product deleted', { id });
      return true;
    } catch (err: unknown) {
      if (isPrismaNotFound(err)) return false;
      throw err;
    }
  }

  /** Ping the database — used by the health endpoint. */
  async ping(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Map a Prisma row to a plain DTO.
   * BigInt IDs and Decimal prices are not JSON-serialisable by default — convert them.
   */
  private toDTO(row: {
    id: bigint;
    name: string;
    category: string;
    price: { toNumber(): number } | number;
    createdAt: Date;
    updatedAt: Date;
  }): ProductDTO {
    return {
      id:        Number(row.id),
      name:      row.name,
      category:  row.category,
      price:     typeof row.price === 'object' ? row.price.toNumber() : row.price,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}

/** Check whether a thrown error is a Prisma "record not found" (P2025). */
function isPrismaNotFound(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2025'
  );
}
