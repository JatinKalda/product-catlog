export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-card animate-pulse">
      <div className="mb-4 flex items-start justify-between">
        <div className="h-5 w-32 rounded-md bg-gray-100" />
        <div className="h-5 w-16 rounded-full bg-gray-100" />
      </div>
      <div className="mb-4 h-7 w-24 rounded-md bg-gray-100" />
      <div className="space-y-2">
        <div className="h-4 w-36 rounded bg-gray-100" />
        <div className="h-4 w-36 rounded bg-gray-100" />
      </div>
      <div className="mt-5 flex gap-2 border-t border-gray-50 pt-4">
        <div className="h-8 flex-1 rounded-lg bg-gray-100" />
        <div className="h-8 flex-1 rounded-lg bg-gray-100" />
        <div className="h-8 w-8 rounded-lg bg-gray-100" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-48 rounded-lg bg-gray-100" />
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-card space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-24 rounded bg-gray-100" />
            <div className="h-4 w-40 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
