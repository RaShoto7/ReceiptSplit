import { isDatabaseConfigured } from '@/lib/db';
import { HomeContent } from '@/components/HomeContent';

function DatabaseNotConfigured() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center">
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ReceiptSplit
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Configuration requise
        </p>
      </div>

      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up stagger-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Base de données non configurée
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
          Pour utiliser ReceiptSplit, configurez une base Postgres :
        </p>
        <ol className="text-gray-600 dark:text-gray-300 text-sm space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">1</span>
            <span>Allez sur le dashboard Vercel</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">2</span>
            <span>Onglet &quot;Storage&quot; → Créer Postgres</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">3</span>
            <span>Liez à ce projet et redéployez</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default function Home() {
  const dbConfigured = isDatabaseConfigured();

  if (!dbConfigured) {
    return <DatabaseNotConfigured />;
  }

  return <HomeContent />;
}
