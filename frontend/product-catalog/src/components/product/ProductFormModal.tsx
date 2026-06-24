import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import type { Product, CreateProductPayload } from '../../types';

const CATEGORIES = [
  'Shoes',
  'Clothing',
  'Electronics',
  'Accessories',
  'Sports',
  'Books',
  'Home',
];

interface ProductFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  product?: Product | null;
  isSubmitting: boolean;
  onSubmit: (data: CreateProductPayload) => void;
  onClose: () => void;
}

export default function ProductFormModal({
  isOpen,
  mode,
  product,
  isSubmitting,
  onSubmit,
  onClose,
}: ProductFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProductPayload>();

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && product) {
        reset({ name: product.name, category: product.category, price: product.price });
      } else {
        reset({ name: '', category: 'Shoes', price: 0 });
      }
    }
  }, [isOpen, mode, product, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md animate-slide-up rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          {mode === 'create' ? 'Add Product' : 'Edit Product'}
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          {mode === 'create'
            ? 'Fill in the details to add a new product.'
            : 'Update the product information below.'}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              {...register('name', {
                required: 'Product name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
              type="text"
              placeholder="e.g. Nike Running Shoes"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Price (₹)
            </label>
            <input
              {...register('price', {
                required: 'Price is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Price must be at least ₹1' },
              })}
              type="number"
              placeholder="e.g. 3999"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {errors.price && (
              <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {mode === 'create' ? 'Adding...' : 'Saving...'}
                </>
              ) : mode === 'create' ? (
                'Add Product'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
