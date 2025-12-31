'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language';
import { createRoomAction } from '@/lib/actions';
import { getSession } from '@/lib/session';
import { SettingsButton } from './SettingsModal';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import Image from 'next/image';

export function HomeContent() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionToken, setSessionToken] = useState('');

  useEffect(() => {
    const session = getSession();
    setSessionToken(session.sessionToken);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set('sessionToken', sessionToken);

    try {
      await createRoomAction(formData);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SettingsButton />
      <PWAInstallPrompt />

      <div className="max-w-md mx-auto px-4 py-12 flex flex-col justify-center min-h-screen">
        {/* Logo and tagline */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-32 h-32 mb-6 animate-bounce-in logo-glow">
            <Image
              src="/logo.svg"
              alt="ReceiptSplit"
              width={128}
              height={128}
              className="w-32 h-32 object-contain"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {t.appName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {t.tagline}
          </p>
        </div>

        {/* Create bill card */}
        <div className="glass-card rounded-3xl shadow-xl p-6 animate-fade-in-up stagger-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
            {t.createNewBill}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Your Name (required) */}
            <div>
              <label
                htmlFor="creatorName"
                className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider"
              >
                {t.yourName} *
              </label>
              <input
                type="text"
                id="creatorName"
                name="creatorName"
                required
                placeholder={t.yourNamePlaceholder}
              />
            </div>

            {/* Bill Name (optional) */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider"
              >
                {t.billName}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder={t.billNamePlaceholder}
              />
            </div>

            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider"
              >
                {t.currency}
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue="EUR"
              >
                <option value="EUR">€ Euro (EUR)</option>
                <option value="USD">$ Dollar (USD)</option>
                <option value="GBP">£ Livre (GBP)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-4 px-6 rounded-2xl text-lg shadow-lg mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t.loading}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {t.createAndShare}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Features section */}
        <div className="mt-8 grid grid-cols-3 gap-4 animate-fade-in-up stagger-3">
          <div className="text-center p-4 glass-card rounded-2xl">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Temps réel</p>
          </div>
          <div className="text-center p-4 glass-card rounded-2xl">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Simple</p>
          </div>
          <div className="text-center p-4 glass-card rounded-2xl">
            <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">Sécurisé</p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8 animate-fade-in-up stagger-4">
          {t.noLoginRequired}
        </p>
      </div>
    </div>
  );
}
