'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language';
import { formatCurrency } from '@/lib/calculations';
import { Participant, Currency } from '@/types';

interface EqualSplitProps {
  totalAmount: number;
  currency: Currency;
  participants: Participant[];
  currentParticipantId: string | null;
  onClose: () => void;
}

export function EqualSplit({
  totalAmount,
  currency,
  participants,
  currentParticipantId,
  onClose,
}: EqualSplitProps) {
  const { language } = useLanguage();
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(
    new Set(participants.map(p => p.id))
  );
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [mode, setMode] = useState<'equal' | 'custom'>('equal');

  const toggleParticipant = (id: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParticipants(newSelected);
  };

  const equalShare = selectedParticipants.size > 0
    ? totalAmount / selectedParticipants.size
    : 0;

  const getParticipantShare = (id: string): number => {
    if (mode === 'custom' && customAmounts[id]) {
      return parseFloat(customAmounts[id]) || 0;
    }
    return selectedParticipants.has(id) ? equalShare : 0;
  };

  const totalCustom = Object.values(customAmounts).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  const remaining = mode === 'custom' ? totalAmount - totalCustom : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'fr' ? 'Diviser l\'addition' : 'Split the bill'}
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

          {/* Mode toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setMode('equal')}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                mode === 'equal'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {language === 'fr' ? 'Parts égales' : 'Equal split'}
            </button>
            <button
              onClick={() => setMode('custom')}
              className={`flex-1 py-2 rounded-xl font-medium text-sm transition-all ${
                mode === 'custom'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {language === 'fr' ? 'Personnalisé' : 'Custom'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Total */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 mb-6 text-white text-center">
            <p className="text-white/80 text-sm">
              {language === 'fr' ? 'Total à diviser' : 'Total to split'}
            </p>
            <p className="text-3xl font-bold">
              {formatCurrency(totalAmount, currency)}
            </p>
          </div>

          {/* Participants list */}
          <div className="space-y-3">
            {participants.map(participant => {
              const isSelected = selectedParticipants.has(participant.id);
              const share = getParticipantShare(participant.id);
              const isMe = participant.id === currentParticipantId;

              return (
                <div
                  key={participant.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {mode === 'equal' && (
                        <button
                          onClick={() => toggleParticipant(participant.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        isMe ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                      }`}>
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {participant.name}
                        </span>
                        {isMe && (
                          <span className="text-blue-500 text-sm ml-1">
                            ({language === 'fr' ? 'Vous' : 'You'})
                          </span>
                        )}
                      </div>
                    </div>

                    {mode === 'equal' ? (
                      <span className={`font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                        {isSelected ? formatCurrency(share, currency) : '-'}
                      </span>
                    ) : (
                      <input
                        type="number"
                        inputMode="decimal"
                        value={customAmounts[participant.id] || ''}
                        onChange={(e) => setCustomAmounts({
                          ...customAmounts,
                          [participant.id]: e.target.value,
                        })}
                        placeholder="0.00"
                        className="w-24 text-right px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 font-medium"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Remaining (custom mode) */}
          {mode === 'custom' && (
            <div className={`mt-4 p-4 rounded-2xl ${
              Math.abs(remaining) < 0.01
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : 'bg-amber-100 dark:bg-amber-900/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`font-medium ${
                  Math.abs(remaining) < 0.01
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {language === 'fr' ? 'Restant' : 'Remaining'}
                </span>
                <span className={`font-bold ${
                  Math.abs(remaining) < 0.01
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-700 dark:text-amber-400'
                }`}>
                  {formatCurrency(remaining, currency)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 p-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-600 dark:text-slate-400">
              {language === 'fr' ? 'Votre part' : 'Your share'}
            </span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(
                currentParticipantId ? getParticipantShare(currentParticipantId) : 0,
                currency
              )}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-full btn-primary py-4 rounded-2xl font-semibold"
          >
            {language === 'fr' ? 'Compris' : 'Got it'}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-safe bg-white dark:bg-slate-900" />
      </div>
    </div>
  );
}
