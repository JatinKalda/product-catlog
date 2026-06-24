import { ChevronDown } from 'lucide-react';

interface LoadMoreProps {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export default function LoadMore({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: LoadMoreProps) {
  if (!hasNextPage) return null;

  return (
    <div className="flex justify-center pt-4">
      <button
        onClick={onLoadMore}
        disabled={isFetchingNextPage}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isFetchingNextPage ? (
          <>
            <svg className="h-4 w-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading more...
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 text-gray-500" />
            Load more products
          </>
        )}
      </button>
    </div>
  );
}
