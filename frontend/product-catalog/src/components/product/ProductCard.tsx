import { Eye, Pencil, Trash2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { formatPrice, formatDate, getCategoryColor } from '../../utils';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const navigate = useNavigate();

  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 animate-fade-in">
      {/* Gradient border on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100 ring-1 ring-blue-400/30" />

      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 leading-snug">
          {product.name}
        </h3>
        <span
          className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getCategoryColor(product.category)}`}
        >
          {product.category}
        </span>
      </div>

      {/* Price */}
      <div className="mb-4">
        <span className="text-2xl font-bold text-gray-900 tracking-tight">
          {formatPrice(product.price)}
        </span>
      </div>

      {/* Dates */}
      <div className="mt-auto space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>Created {formatDate(product.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>Updated {formatDate(product.updatedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2 border-t border-gray-50 pt-4">
        <button
          onClick={() => navigate(`/products/${product.id}`)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </button>
        <button
          onClick={() => onEdit(product)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={() => onDelete(product)}
          className="flex items-center justify-center rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:bg-red-100"
          aria-label="Delete product"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
