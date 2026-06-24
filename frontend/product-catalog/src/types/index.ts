export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductResponse {
  items: Product[];
  nextCursor: string | null;
}

export interface CreateProductPayload {
  name: string;
  category: string;
  price: number;
}

export interface UpdateProductPayload {
  name?: string;
  category?: string;
  price?: number;
}

export type ModalMode = 'create' | 'edit' | null;
