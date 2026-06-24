import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Tag, DollarSign, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { formatPrice, formatDateTime, getCategoryColor } from '../utils';
import { DetailSkeleton } from '../components/ui/LoadingSkeleton';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = Number(id);

  const { data: product, isLoading, isError, error, refetch } = useProduct(productId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {isLoading ? (
        <DetailSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-red-100 bg-red-50/50 py-20 text-center">
          <AlertCircle className="mb-4 h-10 w-10 text-red-400" />
          <h3 className="mb-1 text-sm font-semibold text-gray-900">Failed to load product</h3>
          <p className="mb-4 text-sm text-gray-500">
            {(error as Error)?.message || 'Product not found.'}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : product ? (
        <div className="animate-fade-in">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">Product ID #{product.id}</p>
            </div>
            <span
              className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${getCategoryColor(product.category)}`}
            >
              {product.category}
            </span>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-card overflow-hidden">
            <div className="divide-y divide-gray-50">
              <DetailRow
                icon={<Package className="h-4 w-4 text-gray-400" />}
                label="Product Name"
                value={product.name}
              />
              <DetailRow
                icon={<Tag className="h-4 w-4 text-gray-400" />}
                label="Category"
                value={product.category}
              />
              <DetailRow
                icon={<DollarSign className="h-4 w-4 text-gray-400" />}
                label="Price"
                value={
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                }
              />
              <DetailRow
                icon={<Calendar className="h-4 w-4 text-gray-400" />}
                label="Created At"
                value={formatDateTime(product.createdAt)}
              />
              <DetailRow
                icon={<Clock className="h-4 w-4 text-gray-400" />}
                label="Updated At"
                value={formatDateTime(product.updatedAt)}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-2.5">
        {icon}
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <span className="text-sm text-gray-900 font-medium text-right max-w-xs">
        {value}
      </span>
    </div>
  );
}
