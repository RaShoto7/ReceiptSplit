'use client';

import { createRoomAction } from '@/lib/actions';
import { useLanguage } from '@/lib/language';
import { SettingsButton } from './SettingsModal';

export function HomeContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[85vh] flex flex-col justify-center">
      <SettingsButton />

      {/* Logo and tagline */}
      <div className="text-center mb-10 animate-fade-in-up">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[22px] bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg mb-6 animate-bounce-in">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t.appName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          {t.tagline}
        </p>
      </div>

      {/* Create bill card */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up stagger-2">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          {t.createNewBill}
        </h2>

        <form action={createRoomAction} className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider"
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
              className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider"
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
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl text-lg shadow-sm mt-2"
          >
            {t.createBill}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8 animate-fade-in-up stagger-3">
        {t.noLoginRequired}
      </p>
    </div>
  );
}
