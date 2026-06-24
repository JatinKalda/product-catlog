import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 text-8xl font-black text-gray-100 select-none tracking-tighter">
        404
      </div>
      <h1 className="mb-2 text-xl font-bold text-gray-900">Page not found</h1>
      <p className="mb-8 max-w-sm text-sm text-gray-500">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Go back
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </button>
      </div>
    </div>
  );
}
