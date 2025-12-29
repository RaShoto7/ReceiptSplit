'use client';

import { useState } from 'react';
import { useLanguage, Language } from '@/lib/language';

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-40 w-11 h-11 rounded-full bg-white dark:bg-[#1c1c1e] shadow-lg flex items-center justify-center animate-fade-in"
        aria-label={t.settings}
      >
        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-white dark:bg-[#1c1c1e] rounded-3xl overflow-hidden animate-slide-in shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t.settings}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
                {t.language}
              </label>

              <div className="space-y-2">
                <LanguageOption
                  label={t.french}
                  flag="🇫🇷"
                  selected={language === 'fr'}
                  onClick={() => setLanguage('fr')}
                />
                <LanguageOption
                  label={t.english}
                  flag="🇬🇧"
                  selected={language === 'en'}
                  onClick={() => setLanguage('en')}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
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
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
        selected
          ? 'bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-500'
          : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{flag}</span>
        <span className={`text-base font-medium ${selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
          {label}
        </span>
      </div>
      {selected && (
        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
