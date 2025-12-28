'use client';

import { Room, Participant, ParticipantTotal, Settlement } from '@/types';
import { formatCurrency } from '@/lib/calculations';
import { useState } from 'react';

interface ResultsSummaryProps {
  room: Room;
  participants: Participant[];
  totals: ParticipantTotal[];
  settlements: Settlement[];
}

export function ResultsSummary({ room, participants, totals, settlements }: ResultsSummaryProps) {
  const [copied, setCopied] = useState(false);

  const grandTotal = totals.reduce((sum, t) => sum + t.total, 0);

  const generateSummaryText = () => {
    const lines: string[] = [];
    lines.push(`Bill Split: ${room.title || 'Untitled'}`);
    lines.push('---');
    lines.push('');

    lines.push('Breakdown:');
    totals.forEach(t => {
      if (t.total > 0) {
        lines.push(`  ${t.participantName}: ${formatCurrency(t.total, room.currency)}`);
      }
    });
    lines.push('');

    if (settlements.length > 0) {
      lines.push('Settlements:');
      settlements.forEach(s => {
        lines.push(`  ${s.fromName} -> ${s.toName}: ${formatCurrency(s.amount, room.currency)}`);
      });
      lines.push('');
    }

    lines.push(`Total: ${formatCurrency(grandTotal, room.currency)}`);
    lines.push('');
    lines.push(`Split with ReceiptSplit: ${typeof window !== 'undefined' ? window.location.href : ''}`);

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Summary
        </h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          Add people and items to see the split
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Summary
        </h2>
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          {formatCurrency(grandTotal, room.currency)}
        </span>
      </div>

      {/* Per-person breakdown */}
      <div className="space-y-3 mb-6">
        {totals.map((t) => (
          <div
            key={t.participantId}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium text-sm">
                  {t.participantName.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {t.participantName}
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-lg">
                {formatCurrency(t.total, room.currency)}
              </span>
            </div>

            {(t.tipShare > 0 || t.taxShare > 0) && (
              <div className="text-sm text-gray-500 dark:text-gray-400 ml-10 space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(t.subtotal, room.currency)}</span>
                </div>
                {t.tipShare > 0 && (
                  <div className="flex justify-between">
                    <span>Tip</span>
                    <span>+{formatCurrency(t.tipShare, room.currency)}</span>
                  </div>
                )}
                {t.taxShare > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>+{formatCurrency(t.taxShare, room.currency)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Settlements */}
      {settlements.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white mb-3">
            Who pays who
          </h3>
          <div className="space-y-2">
            {settlements.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {s.fromName}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {s.toName}
                  </span>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">
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
        className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Summary
          </>
        )}
      </button>
    </div>
  );
}
