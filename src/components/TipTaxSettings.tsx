'use client';

import { Room, TipTaxType } from '@/types';
import { updateTipTaxAction } from '@/lib/actions';
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Tip & Tax
      </h2>

      <form action={handleSubmit} className="space-y-4">
        {/* Tip Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tip
          </label>
          <div className="flex gap-2">
            <select
              value={tipType}
              onChange={(e) => setTipType(e.target.value as TipTaxType)}
              className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="none">No tip</option>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>

            {tipType !== 'none' && (
              <div className="relative flex-1">
                <input
                  type="number"
                  value={tipValue}
                  onChange={(e) => setTipValue(e.target.value)}
                  min="0"
                  step={tipType === 'percent' ? '1' : '0.01'}
                  className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {tipType === 'percent' ? '%' : '$'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tax Settings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tax
          </label>
          <div className="flex gap-2">
            <select
              value={taxType}
              onChange={(e) => setTaxType(e.target.value as TipTaxType)}
              className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="none">No tax</option>
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>

            {taxType !== 'none' && (
              <div className="relative flex-1">
                <input
                  type="number"
                  value={taxValue}
                  onChange={(e) => setTaxValue(e.target.value)}
                  min="0"
                  step={taxType === 'percent' ? '1' : '0.01'}
                  className="w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {taxType === 'percent' ? '%' : '$'}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl disabled:opacity-50"
        >
          {isUpdating ? 'Updating...' : 'Update Tip & Tax'}
        </button>
      </form>
    </div>
  );
}
