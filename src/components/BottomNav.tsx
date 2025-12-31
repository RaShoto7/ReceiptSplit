'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language';

export type TabId = 'items' | 'bill' | 'moments' | 'pay';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  showPayTab?: boolean;
  photosCount?: number;
  itemsCount?: number;
}

export function BottomNav({
  activeTab,
  onTabChange,
  showPayTab = false,
  photosCount = 0,
  itemsCount = 0,
}: BottomNavProps) {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tabs = [
    {
      id: 'items' as TabId,
      label: language === 'fr' ? 'Mes Articles' : 'My Items',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all ${active ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      badge: itemsCount > 0 ? itemsCount : undefined,
    },
    {
      id: 'bill' as TabId,
      label: language === 'fr' ? 'Addition' : 'Full Bill',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all ${active ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'moments' as TabId,
      label: language === 'fr' ? 'Moments' : 'Moments',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all ${active ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badge: photosCount > 0 ? photosCount : undefined,
    },
  ];

  // Add pay tab if in paying mode
  if (showPayTab) {
    tabs.push({
      id: 'pay' as TabId,
      label: language === 'fr' ? 'Payer' : 'Pay',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 transition-all ${active ? 'scale-110' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-950/80 backdrop-blur-xl" />

      {/* Safe area padding for iOS */}
      <div className="relative max-w-lg mx-auto px-2 pb-safe">
        <div className="flex items-stretch justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-x-2 top-1 bottom-1 bg-blue-50 dark:bg-blue-900/30 rounded-2xl -z-10 animate-scale-in" />
                )}

                {/* Icon */}
                <div className="relative">
                  {tab.icon(isActive)}

                  {/* Badge */}
                  {tab.badge !== undefined && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-rose-500/30">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={`mt-1 text-[11px] font-medium transition-all ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Home indicator area for iOS */}
      <div className="h-safe bg-white dark:bg-slate-950" />
    </nav>
  );
}

// CSS for safe area
const style = `
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
  .h-safe {
    height: env(safe-area-inset-bottom, 0px);
  }
`;

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = style;
  document.head.appendChild(styleEl);
}
