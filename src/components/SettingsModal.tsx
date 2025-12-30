'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/language';

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="fixed top-4 right-4 z-40" ref={dropdownRef}>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-11 h-11 rounded-full premium-card shadow-lg flex items-center justify-center animate-fade-in transition-all duration-300 ${
          isOpen ? 'rotate-90 ring-2 ring-amber-400' : ''
        }`}
        aria-label={t.settings}
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute right-0 mt-2 w-56 origin-top-right transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="premium-card rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.language}
            </p>
          </div>

          {/* Language Options */}
          <div className="p-2">
            <LanguageOption
              label={t.french}
              flag="🇫🇷"
              selected={language === 'fr'}
              onClick={() => {
                setLanguage('fr');
                setIsOpen(false);
              }}
            />
            <LanguageOption
              label={t.english}
              flag="🇬🇧"
              selected={language === 'en'}
              onClick={() => {
                setLanguage('en');
                setIsOpen(false);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageOption({
  label,
  flag,
  selected,
  onClick,
}: {
  label: string;
  flag: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        selected
          ? 'bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`}
    >
      <span className="text-xl">{flag}</span>
      <span className={`text-sm font-medium flex-1 text-left ${
        selected ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-200'
      }`}>
        {label}
      </span>
      {selected && (
        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
