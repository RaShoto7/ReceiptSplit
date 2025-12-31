'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLanguage } from '@/lib/language';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { Room } from '@/types';
import { formatCurrency } from '@/lib/calculations';

interface HistoryClientProps {
  rooms: Room[];
  userName: string;
}

export function HistoryClient({ rooms, userName }: HistoryClientProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'active' | 'paying' | 'closed'>('all');

  const filteredRooms = rooms.filter(room => {
    if (filter === 'all') return true;
    return room.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
            {language === 'fr' ? 'En cours' : 'Active'}
          </span>
        );
      case 'paying':
        return (
          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">
            {language === 'fr' ? 'Paiement' : 'Paying'}
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-medium">
            {language === 'fr' ? 'Terminé' : 'Closed'}
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <main className="min-h-screen pb-24 relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="glass-card pt-12 pb-6 px-4 rounded-b-3xl shadow-lg relative z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-all"
            >
              <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="px-4 py-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              {language === 'fr' ? 'Déconnexion' : 'Sign out'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {language === 'fr' ? 'Bonjour' : 'Hello'}, {userName}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {rooms.length} {language === 'fr' ? 'additions' : 'bills'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 relative z-10">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'active', 'paying', 'closed'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              {status === 'all' && (language === 'fr' ? 'Toutes' : 'All')}
              {status === 'active' && (language === 'fr' ? 'En cours' : 'Active')}
              {status === 'paying' && (language === 'fr' ? 'Paiement' : 'Paying')}
              {status === 'closed' && (language === 'fr' ? 'Terminées' : 'Closed')}
            </button>
          ))}
        </div>

        {/* Room List */}
        {filteredRooms.length === 0 ? (
          <div className="premium-card rounded-3xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {language === 'fr' ? 'Aucune addition' : 'No bills'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              {language === 'fr'
                ? 'Vos additions apparaîtront ici'
                : 'Your bills will appear here'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary px-6 py-3 rounded-xl font-medium"
            >
              {language === 'fr' ? 'Créer une addition' : 'Create a bill'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRooms.map(room => (
              <button
                key={room.id}
                onClick={() => router.push(`/r/${room.id}`)}
                className="w-full premium-card rounded-2xl p-4 text-left hover:scale-[1.02] transition-transform active:scale-[0.98]"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {room.title || (language === 'fr' ? 'Addition sans titre' : 'Untitled bill')}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {formatDate(room.created_at)}
                    </p>
                  </div>
                  {getStatusBadge(room.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {room.currency}
                  </span>
                  <span className="font-mono">#{room.id}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
