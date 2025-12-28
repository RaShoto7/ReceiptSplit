'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  const isDatabaseError = error.message?.includes('database') ||
                          error.message?.includes('POSTGRES') ||
                          error.message?.includes('connection');

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md">
        <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-3">
          Something went wrong
        </h2>

        {isDatabaseError ? (
          <div className="text-red-700 dark:text-red-300 text-sm space-y-2">
            <p>There was a problem connecting to the database.</p>
            <p className="text-xs">
              Make sure Vercel Postgres is set up and linked to your project.
            </p>
          </div>
        ) : (
          <p className="text-red-700 dark:text-red-300 text-sm">
            An unexpected error occurred. Please try again.
          </p>
        )}

        <div className="flex gap-3 mt-6 justify-center">
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl text-sm"
          >
            Try again
          </button>
          <a
            href="/"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-xl text-sm"
          >
            Go home
          </a>
        </div>

        {error.digest && (
          <p className="text-xs text-red-400 mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
