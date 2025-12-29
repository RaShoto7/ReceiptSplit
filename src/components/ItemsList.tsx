'use client';

import { Item, Participant, ItemAssignment, Currency, CURRENCY_SYMBOLS } from '@/types';
import { addItemAction, removeItemAction, updateAssignmentsAction } from '@/lib/actions';
import { useLanguage } from '@/lib/language';
import { useState, useRef } from 'react';

interface ItemsListProps {
  roomId: string;
  items: Item[];
  participants: Participant[];
  assignments: ItemAssignment[];
  currency: Currency;
}

export function ItemsList({ roomId, items, participants, assignments, currency }: ItemsListProps) {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();
  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const handleAddItem = async (formData: FormData) => {
    setError(null);
    formData.set('roomId', roomId);
    const result = await addItemAction(formData);
    if ('error' in result && result.error) {
      setError(result.error);
    } else {
      formRef.current?.reset();
    }
  };

  const getItemAssignments = (itemId: string) => {
    return assignments
      .filter(a => a.item_id === itemId)
      .map(a => a.participant_id);
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm overflow-hidden animate-fade-in-up stagger-2">
      <div className="p-5 pb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t.items}
        </h2>
      </div>

      {participants.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm px-5 pb-5">
          {t.addPeopleFirst}
        </p>
      ) : (
        <>
          {items.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm px-5 pb-4">
              {t.addItemsToSplit}
            </p>
          ) : (
            <ul className="mb-2">
              {items.map((item, index) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  roomId={roomId}
                  participants={participants}
                  assignedIds={getItemAssignments(item.id)}
                  currency={currency}
                  currencySymbol={currencySymbol}
                  index={index}
                />
              ))}
            </ul>
          )}

          <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-800">
            <form ref={formRef} action={handleAddItem} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  name="name"
                  placeholder={t.itemNamePlaceholder}
                  required
                  className="flex-1"
                />
                <input
                  type="number"
                  name="amount"
                  placeholder={`${currencySymbol}0.00`}
                  step="0.01"
                  min="0.01"
                  required
                  className="w-24"
                />
                <input
                  type="number"
                  name="quantity"
                  placeholder={t.quantity}
                  defaultValue="1"
                  min="1"
                  className="w-16"
                />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  name="category"
                  placeholder={t.categoryOptional}
                  className="flex-1 text-sm"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-5 rounded-xl shrink-0"
                >
                  {t.add}
                </button>
              </div>
            </form>

            {error && (
              <p className="text-red-500 text-sm mt-2 px-1">{error}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface ItemRowProps {
  item: Item;
  roomId: string;
  participants: Participant[];
  assignedIds: string[];
  currency: Currency;
  currencySymbol: string;
  index: number;
}

function ItemRow({ item, roomId, participants, assignedIds, currencySymbol, index }: ItemRowProps) {
  const [localAssigned, setLocalAssigned] = useState<string[]>(assignedIds);
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  const totalCost = Number(item.amount) * item.quantity;

  const handleCheckboxChange = async (participantId: string, checked: boolean) => {
    const newAssigned = checked
      ? [...localAssigned, participantId]
      : localAssigned.filter(id => id !== participantId);

    setLocalAssigned(newAssigned);

    const formData = new FormData();
    formData.set('itemId', item.id);
    formData.set('roomId', roomId);
    newAssigned.forEach(id => formData.append('participantIds', id));
    await updateAssignmentsAction(formData);
  };

  const handleSelectAll = async () => {
    const allIds = participants.map(p => p.id);
    setLocalAssigned(allIds);

    const formData = new FormData();
    formData.set('itemId', item.id);
    formData.set('roomId', roomId);
    allIds.forEach(id => formData.append('participantIds', id));
    await updateAssignmentsAction(formData);
  };

  const handleClearAll = async () => {
    setLocalAssigned([]);

    const formData = new FormData();
    formData.set('itemId', item.id);
    formData.set('roomId', roomId);
    await updateAssignmentsAction(formData);
  };

  return (
    <li
      className="border-b border-gray-100 dark:border-gray-800 last:border-0"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div
        className="flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 dark:active:bg-gray-800/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 dark:text-white truncate">
              {item.name}
            </span>
            {item.quantity > 1 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                x{item.quantity}
              </span>
            )}
            {item.category && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {item.category}
              </span>
            )}
          </div>
          <div className="text-sm mt-1">
            {localAssigned.length === 0 ? (
              <span className="text-orange-500 dark:text-orange-400">{t.notAssigned}</span>
            ) : localAssigned.length === participants.length ? (
              <span className="text-gray-500 dark:text-gray-400">{t.splitByAll} ({participants.length})</span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">{t.splitBy} {localAssigned.length}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-3">
          <span className="font-semibold text-gray-900 dark:text-white whitespace-nowrap">
            {currencySymbol}{totalCost.toFixed(2)}
          </span>

          <form
            action={removeItemAction}
            onClick={(e) => e.stopPropagation()}
          >
            <input type="hidden" name="roomId" value={roomId} />
            <input type="hidden" name="itemId" value={item.id} />
            <button
              type="submit"
              className="w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>

          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="flex gap-3 mb-3">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-500 hover:text-blue-600 font-medium"
            >
              {t.selectAll}
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-sm text-gray-500 hover:text-gray-600 font-medium"
            >
              {t.clear}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {participants.map((participant) => (
              <label
                key={participant.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  localAssigned.includes(participant.id)
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={localAssigned.includes(participant.id)}
                  onChange={(e) => handleCheckboxChange(participant.id, e.target.checked)}
                />
                <span className={`text-sm truncate ${
                  localAssigned.includes(participant.id)
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {participant.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
