export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

export function formatDateTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Shoes: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    Clothing: 'bg-purple-50 text-purple-700 ring-purple-600/20',
    Electronics: 'bg-green-50 text-green-700 ring-green-600/20',
    Accessories: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    Sports: 'bg-red-50 text-red-700 ring-red-600/20',
    Books: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    Home: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  };
  return colors[category] ?? 'bg-gray-50 text-gray-700 ring-gray-600/20';
}

export function filterProductsByName<T extends { name: string }>(
  products: T[],
  query: string
): T[] {
  if (!query.trim()) return products;
  const lower = query.toLowerCase();
  return products.filter((p) => p.name.toLowerCase().includes(lower));
}
