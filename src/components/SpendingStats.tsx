'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/lib/language';
import { formatCurrency } from '@/lib/calculations';
import { Room, Item, Currency } from '@/types';

interface SpendingStatsProps {
  rooms: Room[];
  items: Item[];
  currency: Currency;
}

export function SpendingStats({ rooms, items, currency }: SpendingStatsProps) {
  const { language } = useLanguage();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Group spending by month
    const monthlySpending: Record<string, number> = {};
    const categorySpending: Record<string, number> = {};

    items.forEach(item => {
      const date = new Date(item.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const amount = Number(item.price) * item.quantity;

      monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + amount;

      // Categorize by keywords
      const name = item.name.toLowerCase();
      let category = 'other';
      if (name.includes('pizza') || name.includes('burger') || name.includes('plat') || name.includes('viande')) {
        category = 'main';
      } else if (name.includes('boisson') || name.includes('coca') || name.includes('eau') || name.includes('bière') || name.includes('vin')) {
        category = 'drinks';
      } else if (name.includes('dessert') || name.includes('glace') || name.includes('gâteau') || name.includes('café')) {
        category = 'desserts';
      } else if (name.includes('entrée') || name.includes('salade') || name.includes('soupe')) {
        category = 'starters';
      }

      categorySpending[category] = (categorySpending[category] || 0) + amount;
    });

    // Get last 6 months
    const last6Months: { month: string; amount: number; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = language === 'fr'
        ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      last6Months.push({
        month: key,
        amount: monthlySpending[key] || 0,
        label: monthNames[d.getMonth()],
      });
    }

    const totalSpent = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const avgPerRoom = rooms.length > 0 ? totalSpent / rooms.length : 0;
    const maxMonth = Math.max(...last6Months.map(m => m.amount), 1);

    return {
      totalSpent,
      avgPerRoom,
      totalRooms: rooms.length,
      last6Months,
      maxMonth,
      categorySpending,
    };
  }, [rooms, items, language]);

  const categoryColors: Record<string, string> = {
    main: '#3b82f6',
    drinks: '#22c55e',
    desserts: '#f43f5e',
    starters: '#fbbf24',
    other: '#8b5cf6',
  };

  const categoryLabels: Record<string, Record<string, string>> = {
    main: { fr: 'Plats', en: 'Main' },
    drinks: { fr: 'Boissons', en: 'Drinks' },
    desserts: { fr: 'Desserts', en: 'Desserts' },
    starters: { fr: 'Entrées', en: 'Starters' },
    other: { fr: 'Autres', en: 'Other' },
  };

  const totalCategory = Object.values(stats.categorySpending).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="premium-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(stats.totalSpent, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'fr' ? 'Total dépensé' : 'Total spent'}
          </p>
        </div>
        <div className="premium-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalRooms}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'fr' ? 'Additions' : 'Bills'}
          </p>
        </div>
        <div className="premium-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(stats.avgPerRoom, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'fr' ? 'Moyenne' : 'Average'}
          </p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="premium-card rounded-3xl p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          {language === 'fr' ? 'Dépenses mensuelles' : 'Monthly spending'}
        </h3>
        <div className="flex items-end justify-between gap-2 h-32">
          {stats.last6Months.map((month, i) => (
            <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500"
                style={{
                  height: `${(month.amount / stats.maxMonth) * 100}%`,
                  minHeight: month.amount > 0 ? '8px' : '2px',
                  opacity: month.amount > 0 ? 1 : 0.3,
                }}
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {month.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="premium-card rounded-3xl p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
          {language === 'fr' ? 'Par catégorie' : 'By category'}
        </h3>

        {/* Pie chart representation as horizontal bars */}
        <div className="space-y-3">
          {Object.entries(stats.categorySpending)
            .sort(([, a], [, b]) => b - a)
            .map(([category, amount]) => {
              const percentage = (amount / totalCategory) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {categoryLabels[category]?.[language] || category}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {formatCurrency(amount, currency)} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: categoryColors[category] || '#8b5cf6',
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
