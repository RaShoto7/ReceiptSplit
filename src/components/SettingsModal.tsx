'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/language';
import { updateRoomBackgroundAction } from '@/lib/actions';

interface SettingsButtonProps {
  roomId?: string;
  isCreator?: boolean;
  hasBackground?: boolean;
  onBackgroundChange?: () => void;
}

export function SettingsButton({ roomId, isCreator, hasBackground, onBackgroundChange }: SettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentHasBackground, setCurrentHasBackground] = useState(hasBackground);

  useEffect(() => {
    setCurrentHasBackground(hasBackground);
  }, [hasBackground]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image too large. Please choose an image under 2MB.');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const imageData = event.target?.result as string;

      const formData = new FormData();
      formData.set('roomId', roomId);
      formData.set('backgroundImage', imageData);

      await updateRoomBackgroundAction(formData);
      setCurrentHasBackground(true);
      setIsUploading(false);
      onBackgroundChange?.();

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveBackground = async () => {
    if (!roomId) return;

    const formData = new FormData();
    formData.set('roomId', roomId);
    formData.set('backgroundImage', '');

    await updateRoomBackgroundAction(formData);
    setCurrentHasBackground(false);
    onBackgroundChange?.();

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed top-8 right-4 z-40" ref={dropdownRef}>
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
        className={`absolute right-0 mt-2 w-64 origin-top-right transition-all duration-300 ease-out ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="premium-card rounded-2xl shadow-xl overflow-hidden">
          {/* Language Section */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t.language}
            </p>
          </div>

          <div className="p-2 border-b border-gray-100 dark:border-gray-800">
            <LanguageOption
              label={t.french}
              flag="🇫🇷"
              selected={language === 'fr'}
              onClick={() => {
                setLanguage('fr');
              }}
            />
            <LanguageOption
              label={t.english}
              flag="🇬🇧"
              selected={language === 'en'}
              onClick={() => {
                setLanguage('en');
              }}
            />
          </div>

          {/* Background Section - Only show for creator in a room */}
          {roomId && isCreator && (
            <>
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.background}
                </p>
              </div>

              <div className="p-3 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="bg-upload"
                />

                <label
                  htmlFor="bg-upload"
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${
                    isUploading ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 flex items-center justify-center">
                    {isUploading ? (
                      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {isUploading ? t.loading : t.uploadPhoto}
                  </span>
                </label>

                {currentHasBackground && (
                  <button
                    onClick={handleRemoveBackground}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all group"
                  >
                    <span className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                      {t.defaultBackground}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}
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
