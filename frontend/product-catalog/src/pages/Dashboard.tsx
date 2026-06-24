import { useState, useMemo } from 'react';
import { Plus, Package, TrendingUp, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  useInfiniteProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../hooks/useProducts';
import type { Product, CreateProductPayload } from '../types';
import { filterProductsByName } from '../utils';

import SearchBar from '../components/ui/SearchBar';
import CategoryFilter from '../components/ui/CategoryFilter';
import ProductGrid from '../components/product/ProductGrid';
import LoadMore from '../components/product/LoadMore';
import ProductFormModal from '../components/product/ProductFormModal';
import DeleteModal from '../components/ui/DeleteModal';
import { ProductGridSkeleton } from '../components/ui/LoadingSkeleton';

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteProducts(selectedCategory);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const allProducts = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );

  const filteredProducts = useMemo(
    () => filterProductsByName(allProducts, searchQuery),
    [allProducts, searchQuery]
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalMode('create');
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setModalMode('edit');
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (data: CreateProductPayload) => {
    if (modalMode === 'create') {
      createProduct.mutate(data, {
        onSuccess: () => {
          toast.success('Product added successfully');
          handleCloseModal();
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to add product');
        },
      });
    } else if (modalMode === 'edit' && editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, payload: data },
        {
          onSuccess: () => {
            toast.success('Product updated successfully');
            handleCloseModal();
          },
          onError: (err) => {
            toast.error(err.message || 'Failed to update product');
          },
        }
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => {
        toast.success('Product deleted');
        setDeletingProduct(null);
      },
      onError: (err) => {
        toast.error(err.message || 'Failed to delete product');
      },
    });
  };

  const totalProducts = allProducts.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Product Catalog Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your product inventory
        </p>
      </div>

      {/* Stats Row */}
      {!isLoading && !isError && (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Loaded</p>
                <p className="text-xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Showing</p>
                <p className="text-xl font-bold text-gray-900">{filteredProducts.length}</p>
              </div>
            </div>
          </div>
          {selectedCategory && (
            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Category</p>
                  <p className="text-sm font-bold text-gray-900">{selectedCategory}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search products..."
        />
        <CategoryFilter value={selectedCategory} onChange={handleCategoryChange} />
        {(searchQuery || selectedCategory) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <ProductGridSkeleton count={8} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-100 bg-red-50/50 py-20 text-center">
          <AlertCircle className="mb-4 h-10 w-10 text-red-400" />
          <h3 className="mb-1 text-sm font-semibold text-gray-900">Failed to load products</h3>
          <p className="mb-4 text-sm text-gray-500 max-w-sm">
            {(error as Error)?.message || 'Could not connect to the backend.'}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <ProductGrid
            products={filteredProducts}
            onEdit={handleOpenEdit}
            onDelete={setDeletingProduct}
            searchQuery={searchQuery}
          />
          <LoadMore
            hasNextPage={!!hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={fetchNextPage}
          />
        </div>
      )}

      {/* Floating Add Button */}
      <button
        onClick={handleOpenCreate}
        className="fixed bottom-8 right-8 flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 z-30"
        aria-label="Add new product"
      >
        <Plus className="h-4 w-4" />
        Add Product
      </button>

      {/* Modals */}
      <ProductFormModal
        isOpen={modalMode !== null}
        mode={modalMode ?? 'create'}
        product={editingProduct}
        isSubmitting={createProduct.isPending || updateProduct.isPending}
        onSubmit={handleFormSubmit}
        onClose={handleCloseModal}
      />

      <DeleteModal
        isOpen={!!deletingProduct}
        productName={deletingProduct?.name ?? ''}
        isDeleting={deleteProduct.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProduct(null)}
      />
    </div>
  );
}
