import { validateCreateProduct, validateUpdateProduct } from '../src/utils/validation';

describe('validateCreateProduct', () => {
  const valid = { name: 'Air Max', category: 'Shoes', price: 99.99 };

  it('accepts valid input',              () => expect(() => validateCreateProduct(valid)).not.toThrow());
  it('returns trimmed name',             () => expect(validateCreateProduct({ ...valid, name: '  Air Max  ' }).name).toBe('Air Max'));
  it('throws on missing name',           () => expect(() => validateCreateProduct({ ...valid, name: undefined })).toThrow());
  it('throws on empty name',             () => expect(() => validateCreateProduct({ ...valid, name: '' })).toThrow());
  it('throws on missing category',       () => expect(() => validateCreateProduct({ ...valid, category: undefined })).toThrow());
  it('throws on price = 0',             () => expect(() => validateCreateProduct({ ...valid, price: 0 })).toThrow());
  it('throws on negative price',        () => expect(() => validateCreateProduct({ ...valid, price: -1 })).toThrow());
  it('throws on non-numeric price',     () => expect(() => validateCreateProduct({ ...valid, price: 'free' })).toThrow());
  it('throws when body is not object',  () => expect(() => validateCreateProduct(null)).toThrow());
  it('normalises price to 2 dp',        () => expect(validateCreateProduct({ ...valid, price: 9.999 }).price).toBe(10.00));
});

describe('validateUpdateProduct', () => {
  it('accepts partial name update',     () => expect(() => validateUpdateProduct({ name: 'New' })).not.toThrow());
  it('accepts partial price update',    () => expect(() => validateUpdateProduct({ price: 49.99 })).not.toThrow());
  it('accepts all fields',              () => expect(() => validateUpdateProduct({ name: 'X', category: 'Y', price: 1 })).not.toThrow());
  it('throws when body is empty',       () => expect(() => validateUpdateProduct({})).toThrow('at least one'));
  it('throws on invalid price',         () => expect(() => validateUpdateProduct({ price: -5 })).toThrow());
  it('throws on empty name',            () => expect(() => validateUpdateProduct({ name: '' })).toThrow());
});
