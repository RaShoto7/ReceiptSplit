'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language';

interface AvatarPickerProps {
  currentAvatar?: string;
  onSelect: (avatar: string) => void;
  onClose: () => void;
}

const avatarCategories = {
  faces: ['😀', '😎', '🤩', '😇', '🥳', '😋', '🤗', '🤠', '🥸', '🤓', '😺', '🐶'],
  food: ['🍕', '🍔', '🍟', '🌮', '🍣', '🍜', '🥗', '🍩', '🧁', '🍪', '🍫', '🍿'],
  animals: ['🦁', '🐻', '🐼', '🐨', '🐯', '🦊', '🐰', '🐸', '🦄', '🐲', '🦋', '🐙'],
  nature: ['🌸', '🌻', '🌺', '🌴', '🌈', '⭐', '🌙', '☀️', '🔥', '💎', '🍀', '🌊'],
  sports: ['⚽', '🏀', '🎾', '🏈', '⚾', '🎮', '🎯', '🏆', '🥇', '🎪', '🎭', '🎨'],
  colors: ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '💜', '💙', '💚'],
};

const backgroundGradients = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-rose-600',
  'from-amber-400 to-orange-600',
  'from-emerald-400 to-teal-600',
  'from-red-400 to-red-600',
  'from-indigo-400 to-indigo-600',
  'from-cyan-400 to-blue-600',
  'from-fuchsia-400 to-pink-600',
  'from-lime-400 to-green-600',
  'from-yellow-400 to-amber-600',
  'from-slate-400 to-slate-600',
];

export function AvatarPicker({ currentAvatar, onSelect, onClose }: AvatarPickerProps) {
  const { language } = useLanguage();
  const [selectedEmoji, setSelectedEmoji] = useState(currentAvatar?.split('|')[0] || '😀');
  const [selectedBg, setSelectedBg] = useState(currentAvatar?.split('|')[1] || backgroundGradients[0]);
  const [activeCategory, setActiveCategory] = useState<keyof typeof avatarCategories>('faces');

  const categoryNames: Record<keyof typeof avatarCategories, { fr: string; en: string }> = {
    faces: { fr: 'Visages', en: 'Faces' },
    food: { fr: 'Nourriture', en: 'Food' },
    animals: { fr: 'Animaux', en: 'Animals' },
    nature: { fr: 'Nature', en: 'Nature' },
    sports: { fr: 'Sports', en: 'Sports' },
    colors: { fr: 'Couleurs', en: 'Colors' },
  };

  const handleSave = () => {
    onSelect(`${selectedEmoji}|${selectedBg}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'fr' ? 'Choisir un avatar' : 'Choose avatar'}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Preview */}
          <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${selectedBg} flex items-center justify-center text-5xl shadow-lg`}>
              {selectedEmoji}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {(Object.keys(avatarCategories) as Array<keyof typeof avatarCategories>).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {categoryNames[cat][language as 'fr' | 'en']}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="grid grid-cols-6 gap-2 mb-6">
            {avatarCategories[activeCategory].map(emoji => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                  selectedEmoji === emoji
                    ? 'bg-blue-100 dark:bg-blue-900/50 ring-2 ring-blue-500'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Background colors */}
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            {language === 'fr' ? 'Couleur de fond' : 'Background color'}
          </p>
          <div className="grid grid-cols-6 gap-2">
            {backgroundGradients.map(gradient => (
              <button
                key={gradient}
                onClick={() => setSelectedBg(gradient)}
                className={`aspect-square rounded-xl bg-gradient-to-br ${gradient} transition-all ${
                  selectedBg === gradient
                    ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900'
                    : ''
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 p-6 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSave}
            className="w-full btn-primary py-4 rounded-2xl font-semibold"
          >
            {language === 'fr' ? 'Enregistrer' : 'Save'}
          </button>
        </div>

        <div className="h-safe bg-white dark:bg-slate-900" />
      </div>
    </div>
  );
}

// Avatar display component
export function Avatar({ avatar, size = 'md', name }: { avatar?: string; size?: 'sm' | 'md' | 'lg'; name?: string }) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-10 h-10 text-xl',
    lg: 'w-16 h-16 text-3xl',
  };

  if (avatar && avatar.includes('|')) {
    const [emoji, gradient] = avatar.split('|');
    return (
      <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {emoji}
      </div>
    );
  }

  // Default avatar with initial
  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium`}>
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}
