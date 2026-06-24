import apiClient from '../api/client';
import type {
  Product,
  ProductResponse,
  CreateProductPayload,
  UpdateProductPayload,
} from '../types';

export const productsService = {
  async getProducts(params?: {
    limit?: number;
    cursor?: string;
    category?: string;
  }): Promise<ProductResponse> {
    const { data } = await apiClient.get<ProductResponse>('/products', {
      params,
    });
    return data;
  },

  async getProductById(id: number): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', payload);
    return data;
  },

  async updateProduct(
    id: number,
    payload: UpdateProductPayload
  ): Promise<Product> {
    const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
    return data;
  },

  async deleteProduct(id: number): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async checkHealth(): Promise<boolean> {
    try {
      await apiClient.get('/health');
      return true;
    } catch {
      return false;
    }
  },
};
