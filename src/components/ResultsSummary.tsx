'use client';

import { Room, Participant, ParticipantTotal, Settlement } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { useState } from 'react';
import { useLanguage } from '@/lib/language';

interface ResultsSummaryProps {
  room: Room;
  participants: Participant[];
  totals: ParticipantTotal[];
  settlements: Settlement[];
}

export function ResultsSummary({ room, participants, totals, settlements }: ResultsSummaryProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  const grandTotal = totals.reduce((sum, t) => sum + t.total, 0);

  const generateSummaryText = () => {
    const lines: string[] = [];
    lines.push(`${t.billSplit}: ${room.title || t.untitled}`);
    lines.push('---');
    lines.push('');

    lines.push(`${t.breakdown}:`);
    totals.forEach(total => {
      if (total.total > 0) {
        lines.push(`  ${total.participantName}: ${formatCurrency(total.total, room.currency)}`);
      }
    });
    lines.push('');

    if (settlements.length > 0) {
      lines.push(`${t.settlements}:`);
      settlements.forEach(s => {
        lines.push(`  ${s.fromName} -> ${s.toName}: ${formatCurrency(s.amount, room.currency)}`);
      });
      lines.push('');
    }

    lines.push(`${t.total}: ${formatCurrency(grandTotal, room.currency)}`);
    lines.push('');
    lines.push(`${t.splitWith}: ${typeof window !== 'undefined' ? window.location.href : ''}`);

    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = generateSummaryText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (participants.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up stagger-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {t.summary}
        </h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          {t.addPeopleAndItems}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up stagger-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t.summary}
        </h2>
        <span className="text-xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(grandTotal, room.currency)}
        </span>
      </div>

      {/* Per-person breakdown */}
      <div className="space-y-3 mb-6">
        {totals.map((total, index) => (
          <div
            key={total.participantId}
            className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {total.participantName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {total.participantName}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                {formatCurrency(total.total, room.currency)}
              </span>
            </div>

            {(total.tipShare > 0 || total.taxShare > 0) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 ml-13 space-y-1 mt-2 pl-13">
                <div className="flex justify-between ml-13">
                  <span>{t.subtotal}</span>
                  <span>{formatCurrency(total.subtotal, room.currency)}</span>
                </div>
                {total.tipShare > 0 && (
                  <div className="flex justify-between ml-13">
                    <span>{t.tip}</span>
                    <span className="text-green-600 dark:text-green-400">+{formatCurrency(total.tipShare, room.currency)}</span>
                  </div>
                )}
                {total.taxShare > 0 && (
                  <div className="flex justify-between ml-13">
                    <span>{t.tax}</span>
                    <span className="text-orange-600 dark:text-orange-400">+{formatCurrency(total.taxShare, room.currency)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mb-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            {t.whoOwesWho}
          </h3>
          <div className="space-y-2">
            {settlements.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {s.fromName}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800/50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {s.toName}
                  </span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                  {formatCurrency(s.amount, room.currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      >
        {copied ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {t.copied}
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {t.copySummary}
          </>
        )}
      </button>
    </div>
  );
}
