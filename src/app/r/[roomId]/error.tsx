'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RoomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Room error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md">
        <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-3">
          Could not load this bill
        </h2>

        <p className="text-red-700 dark:text-red-300 text-sm mb-4">
          There was a problem loading the bill. This could be due to a database connection issue.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-xl text-sm"
          >
            Try again
          </button>
          <Link
            href="/"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-xl text-sm"
          >
            Create new bill
          </Link>
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
