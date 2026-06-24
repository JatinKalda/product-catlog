import { ChevronDown, Tag } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Shoes',
  'Clothing',
  'Electronics',
  'Accessories',
  'Sports',
  'Books',
  'Home',
];

interface CategoryFilterProps {
  value: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="relative">
      <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm font-medium text-gray-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat === 'All Categories' ? '' : cat}>
            {cat}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}
