import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-zinc-500 text-2xl">📄</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-900 mb-2">
            Page Not Found
          </h1>
          <p className="text-zinc-600 text-sm mb-4">
            The page you're looking for doesn't exist.
          </p>
        </div>
        
        <Link
          href="/"
          className="w-full px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors inline-block"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}