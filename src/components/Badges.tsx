'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/lib/language';
import { Room, Item, Payment } from '@/types';

interface BadgesProps {
  rooms: Room[];
  items: Item[];
  payments: Payment[];
  participantId?: string;
}

interface Badge {
  id: string;
  name: { fr: string; en: string };
  description: { fr: string; en: string };
  icon: string;
  color: string;
  unlocked: boolean;
  progress?: number;
  target?: number;
}

export function Badges({ rooms, items, payments, participantId }: BadgesProps) {
  const { language } = useLanguage();

  const badges = useMemo<Badge[]>(() => {
    const myItems = participantId
      ? items.filter(i => i.created_by_participant_id === participantId)
      : items;
    const myPayments = participantId
      ? payments.filter(p => p.paid_by_participant_id === participantId)
      : payments;

    const totalSpent = myItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const totalPaid = myPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    return [
      {
        id: 'first_bill',
        name: { fr: 'Première Addition', en: 'First Bill' },
        description: { fr: 'Créer votre première addition', en: 'Create your first bill' },
        icon: '🎉',
        color: 'from-amber-400 to-orange-500',
        unlocked: rooms.length >= 1,
        progress: Math.min(rooms.length, 1),
        target: 1,
      },
      {
        id: 'social_butterfly',
        name: { fr: 'Papillon Social', en: 'Social Butterfly' },
        description: { fr: 'Participer à 5 additions', en: 'Join 5 bills' },
        icon: '🦋',
        color: 'from-pink-400 to-rose-500',
        unlocked: rooms.length >= 5,
        progress: Math.min(rooms.length, 5),
        target: 5,
      },
      {
        id: 'regular',
        name: { fr: 'Habitué', en: 'Regular' },
        description: { fr: 'Participer à 10 additions', en: 'Join 10 bills' },
        icon: '⭐',
        color: 'from-yellow-400 to-amber-500',
        unlocked: rooms.length >= 10,
        progress: Math.min(rooms.length, 10),
        target: 10,
      },
      {
        id: 'big_spender',
        name: { fr: 'Gros Dépensier', en: 'Big Spender' },
        description: { fr: 'Dépenser plus de 100€', en: 'Spend over €100' },
        icon: '💸',
        color: 'from-green-400 to-emerald-500',
        unlocked: totalSpent >= 100,
        progress: Math.min(totalSpent, 100),
        target: 100,
      },
      {
        id: 'generous',
        name: { fr: 'Généreux', en: 'Generous' },
        description: { fr: 'Payer pour les autres 3 fois', en: 'Pay for others 3 times' },
        icon: '🤝',
        color: 'from-blue-400 to-indigo-500',
        unlocked: myPayments.length >= 3,
        progress: Math.min(myPayments.length, 3),
        target: 3,
      },
      {
        id: 'foodie',
        name: { fr: 'Gourmet', en: 'Foodie' },
        description: { fr: 'Commander 20 articles', en: 'Order 20 items' },
        icon: '🍽️',
        color: 'from-purple-400 to-violet-500',
        unlocked: myItems.length >= 20,
        progress: Math.min(myItems.length, 20),
        target: 20,
      },
      {
        id: 'photographer',
        name: { fr: 'Photographe', en: 'Photographer' },
        description: { fr: 'Partager 5 photos', en: 'Share 5 photos' },
        icon: '📸',
        color: 'from-cyan-400 to-blue-500',
        unlocked: false, // Would need photos count
        progress: 0,
        target: 5,
      },
      {
        id: 'early_bird',
        name: { fr: 'Lève-tôt', en: 'Early Bird' },
        description: { fr: 'Commander avant 10h', en: 'Order before 10am' },
        icon: '🌅',
        color: 'from-orange-400 to-red-500',
        unlocked: myItems.some(item => {
          const hour = new Date(item.created_at).getHours();
          return hour < 10;
        }),
      },
      {
        id: 'night_owl',
        name: { fr: 'Noctambule', en: 'Night Owl' },
        description: { fr: 'Commander après 22h', en: 'Order after 10pm' },
        icon: '🦉',
        color: 'from-indigo-400 to-purple-500',
        unlocked: myItems.some(item => {
          const hour = new Date(item.created_at).getHours();
          return hour >= 22;
        }),
      },
      {
        id: 'speed_payer',
        name: { fr: 'Payeur Rapide', en: 'Speed Payer' },
        description: { fr: 'Payer en moins d\'1 min', en: 'Pay within 1 minute' },
        icon: '⚡',
        color: 'from-yellow-400 to-orange-500',
        unlocked: totalPaid > 0,
      },
      {
        id: 'perfectionist',
        name: { fr: 'Perfectionniste', en: 'Perfectionist' },
        description: { fr: 'Addition sans reste à payer', en: 'Bill with no remaining' },
        icon: '✨',
        color: 'from-teal-400 to-cyan-500',
        unlocked: rooms.some(r => r.status === 'closed'),
      },
      {
        id: 'legend',
        name: { fr: 'Légende', en: 'Legend' },
        description: { fr: 'Débloquer tous les badges', en: 'Unlock all badges' },
        icon: '👑',
        color: 'from-amber-400 via-yellow-500 to-amber-400',
        unlocked: false, // Check if all others unlocked
      },
    ];
  }, [rooms, items, payments, participantId]);

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="premium-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {language === 'fr' ? 'Badges débloqués' : 'Badges unlocked'}
          </span>
          <span className="text-sm font-bold text-blue-500">
            {unlockedCount}/{badges.length}
          </span>
        </div>
        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
            style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-3 gap-3">
        {badges.map(badge => (
          <div
            key={badge.id}
            className={`premium-card rounded-2xl p-3 text-center transition-all ${
              badge.unlocked
                ? 'ring-2 ring-amber-400 ring-offset-2 dark:ring-offset-slate-900'
                : 'opacity-50 grayscale'
            }`}
          >
            <div
              className={`w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl ${
                badge.unlocked
                  ? `bg-gradient-to-br ${badge.color}`
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              {badge.icon}
            </div>
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {badge.name[language]}
            </p>
            {badge.progress !== undefined && badge.target && !badge.unlocked && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                {badge.progress}/{badge.target}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
