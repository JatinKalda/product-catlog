/**
 * Request body validation
 *
 * Validates inputs at the HTTP boundary before they reach the service layer.
 * Throws plain Error objects — the route handler converts them to HTTP 400 responses.
 */

import { CreateProductDTO, UpdateProductDTO } from '../types';

const RULES = {
  name:     { minLength: 1, maxLength: 255 },
  category: { minLength: 1, maxLength: 100 },
  price:    { min: 0.01, max: 999_999.99 }, // fixed: 0 is not a valid product price
};

function validateName(name: unknown): string {
  if (typeof name !== 'string') throw new Error('name must be a string');
  const trimmed = name.trim();
  if (trimmed.length < RULES.name.minLength) throw new Error('name cannot be empty');
  if (trimmed.length > RULES.name.maxLength)
    throw new Error(`name must be at most ${RULES.name.maxLength} characters`);
  return trimmed;
}

function validateCategory(category: unknown): string {
  if (typeof category !== 'string') throw new Error('category must be a string');
  const trimmed = category.trim();
  if (trimmed.length < RULES.category.minLength) throw new Error('category cannot be empty');
  if (trimmed.length > RULES.category.maxLength)
    throw new Error(`category must be at most ${RULES.category.maxLength} characters`);
  return trimmed;
}

function validatePrice(price: unknown): number {
  if (typeof price !== 'number' || isNaN(price))
    throw new Error('price must be a number');
  if (price < RULES.price.min)
    throw new Error(`price must be at least ${RULES.price.min}`);
  if (price > RULES.price.max)
    throw new Error(`price must be at most ${RULES.price.max}`);
  return Math.round(price * 100) / 100; // normalise to 2 dp
}

/** Validate and return a typed CreateProductDTO. Throws on any violation. */
export function validateCreateProduct(data: unknown): CreateProductDTO {
  if (!data || typeof data !== 'object') throw new Error('request body must be a JSON object');
  const body = data as Record<string, unknown>;

  return {
    name:     validateName(body.name),
    category: validateCategory(body.category),
    price:    validatePrice(body.price),
  };
}

/** Validate a partial update. At least one field must be present. */
export function validateUpdateProduct(data: unknown): UpdateProductDTO {
  if (!data || typeof data !== 'object') throw new Error('request body must be a JSON object');
  const body = data as Record<string, unknown>;
  const update: UpdateProductDTO = {};

  if (body.name      !== undefined) update.name     = validateName(body.name);
  if (body.category  !== undefined) update.category = validateCategory(body.category);
  if (body.price     !== undefined) update.price    = validatePrice(body.price);

  if (Object.keys(update).length === 0)
    throw new Error('at least one of name, category, or price must be provided');

  return update;
}
