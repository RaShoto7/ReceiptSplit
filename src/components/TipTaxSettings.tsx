'use client';

import { Room, TipTaxType, Currency, CURRENCY_SYMBOLS } from '@/types';
import { updateTipTaxAction } from '@/lib/actions';
import { useLanguage } from '@/lib/language';
import { useState } from 'react';

interface TipTaxSettingsProps {
  room: Room;
}

export function TipTaxSettings({ room }: TipTaxSettingsProps) {
  const [tipType, setTipType] = useState<TipTaxType>(room.tip_type as TipTaxType);
  const [tipValue, setTipValue] = useState<string>(Number(room.tip_value).toString());
  const [taxType, setTaxType] = useState<TipTaxType>(room.tax_type as TipTaxType);
  const [taxValue, setTaxValue] = useState<string>(Number(room.tax_value).toString());
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useLanguage();
  const currencySymbol = CURRENCY_SYMBOLS[room.currency as Currency];

  const handleSubmit = async (formData: FormData) => {
    setIsUpdating(true);
    formData.set('roomId', room.id);
    formData.set('tipType', tipType);
    formData.set('tipValue', tipValue);
    formData.set('taxType', taxType);
    formData.set('taxValue', taxValue);
    await updateTipTaxAction(formData);
    setIsUpdating(false);
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm overflow-hidden animate-fade-in-up stagger-3">
      <div className="p-5 pb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t.tipAndTax}
        </h2>
      </div>

      <form action={handleSubmit} className="px-5 pb-5 space-y-4">
        {/* Tip Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            {t.tip}
          </label>
          <div className="flex gap-2">
            <select
              value={tipType}
              onChange={(e) => setTipType(e.target.value as TipTaxType)}
              className="flex-1"
            >
              <option value="none">{t.noTip}</option>
              <option value="percent">{t.percentage}</option>
              <option value="fixed">{t.fixedAmount}</option>
            </select>

            {tipType !== 'none' && (
              <div className="relative flex-1">
                <input
                  type="number"
                  value={tipValue}
                  onChange={(e) => setTipValue(e.target.value)}
                  min="0"
                  step={tipType === 'percent' ? '1' : '0.01'}
                  placeholder={tipType === 'percent' ? '15' : '10.00'}
                  className="w-full pr-10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  {tipType === 'percent' ? '%' : currencySymbol}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tax Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            {t.tax}
          </label>
          <div className="flex gap-2">
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value as TipTaxType)}
              className="flex-1"
            >
              <option value="none">{t.noTax}</option>
              <option value="percent">{t.percentage}</option>
              <option value="fixed">{t.fixedAmount}</option>
            </select>

            {taxType !== 'none' && (
              <div className="relative flex-1">
                <input
                  type="number"
                  value={taxValue}
                  onChange={(e) => setTaxValue(e.target.value)}
                  min="0"
                  step={taxType === 'percent' ? '1' : '0.01'}
                  placeholder={taxType === 'percent' ? '20' : '5.00'}
                  className="w-full pr-10"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  {taxType === 'percent' ? '%' : currencySymbol}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-3.5 px-4 rounded-xl disabled:opacity-50 mt-2"
        >
          {isUpdating ? t.updating : t.update}
        </button>
      </form>
    </div>
  );
}
