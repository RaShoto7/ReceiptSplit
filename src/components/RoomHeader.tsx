'use client';

import { Room, CURRENCY_SYMBOLS } from '@/types';
import { useLanguage } from '@/lib/language';
import { useState } from 'react';
import { SettingsButton } from './SettingsModal';
import Link from 'next/link';

interface RoomHeaderProps {
  room: Room;
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: room.title || 'ReceiptSplit',
          text: t.tagline,
          url,
        });
      } catch {
        await copyToClipboard(url);
      }
    } else {
      await copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SettingsButton />

      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-5 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/"
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {room.title || t.untitledBill}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {CURRENCY_SYMBOLS[room.currency]} {room.currency}
            </p>
          </div>

          <button
            onClick={handleShare}
            className={`flex items-center gap-2 font-medium py-2.5 px-4 rounded-full text-sm transition-all ${
              copied
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            }`}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t.copied}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {t.share}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
