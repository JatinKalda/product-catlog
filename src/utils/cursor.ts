/**
 * Cursor Pagination Utilities
 *
 * Implements keyset (cursor-based) pagination to solve OFFSET pagination problems:
 * - No missing records when rows are inserted/deleted during browsing
 * - No duplicate records across pages
 * - Constant O(log n) performance via composite B-tree index, regardless of depth
 */

import { CursorPayload, EncodedCursor } from '../types';
import config from '../config';

/**
 * Encode (updatedAt, id) into a URL-safe base64 cursor.
 * The cursor is opaque to clients — they treat it as a black box.
 */
export function encodeCursor(payload: CursorPayload): EncodedCursor {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

/**
 * Decode a base64 cursor back into its payload.
 * Throws a typed error so the route can return HTTP 400 instead of 500.
 */
export function decodeCursor(cursor: EncodedCursor): CursorPayload {
  try {
    const json = Buffer.from(cursor, 'base64').toString('utf-8');
    const parsed = JSON.parse(json) as CursorPayload;
    if (!parsed.updatedAt || typeof parsed.id !== 'number') {
      throw new Error('malformed payload');
    }
    return parsed;
  } catch {
    throw new Error('Invalid cursor format');
  }
}

/**
 * Clamp the requested page size to [1, MAX_LIMIT].
 * Always returns a safe integer — never crashes at query time.
 */
export function validateLimit(limit?: number | string): number {
  const { defaultLimit, maxLimit } = config.pagination;
  if (!limit) return defaultLimit;
  const parsed = typeof limit === 'string' ? parseInt(limit, 10) : Math.floor(limit);
  if (isNaN(parsed) || parsed < 1) return defaultLimit;
  return Math.min(parsed, maxLimit);
}

/**
 * Build the Prisma WHERE clause for keyset pagination.
 *
 * For cursor (T, N) and ORDER BY updatedAt DESC, id DESC, the condition
 * "rows that come after the cursor" expands to:
 *   updatedAt < T  OR  (updatedAt = T AND id < N)
 *
 * PostgreSQL evaluates this using the composite index idx_products_updated_id
 * in O(log n) regardless of how deep into the list the cursor points.
 */
export function buildCursorWhereClause(cursor: CursorPayload) {
  const cursorDate = new Date(cursor.updatedAt);
  return {
    OR: [
      { updatedAt: { lt: cursorDate } },
      {
        AND: [
          { updatedAt: cursorDate },
          { id: { lt: cursor.id } },
        ],
      },
    ],
  };
}
