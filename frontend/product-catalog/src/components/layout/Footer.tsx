export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} ProductCatalog. All rights reserved.
        </p>
        <p className="text-xs text-gray-400">
          Connected to{' '}
          <span className="font-medium text-gray-500">
            {import.meta.env.VITE_API_URL || 'http://localhost:3000'}
          </span>
        </p>
      </div>
    </footer>
  );
}
