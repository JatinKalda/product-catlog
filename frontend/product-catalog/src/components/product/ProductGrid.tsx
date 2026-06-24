import type { Product } from '../../types';
import ProductCard from './ProductCard';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  searchQuery: string;
}

export default function ProductGrid({
  products,
  onEdit,
  onDelete,
  searchQuery,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <Package className="h-7 w-7 text-gray-400" />
        </div>
        <h3 className="mb-1 text-sm font-semibold text-gray-900">No products found</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          {searchQuery
            ? `No products match "${searchQuery}". Try a different search term.`
            : 'Add your first product using the button below.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
