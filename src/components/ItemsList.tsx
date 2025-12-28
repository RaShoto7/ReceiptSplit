'use client';

import { Item, Participant, ItemAssignment } from '@/types';
import { addItemAction, removeItemAction, updateAssignmentsAction } from '@/lib/actions';
import { useState, useRef } from 'react';

interface ItemsListProps {
  roomId: string;
  items: Item[];
  participants: Participant[];
  assignments: ItemAssignment[];
}

export function ItemsList({ roomId, items, participants, assignments }: ItemsListProps) {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Items
      </h2>

      {participants.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
          Add people first before adding items
        </p>
      ) : (
        <>
          {items.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
              Add items to split
            </p>
          ) : (
            <ul className="space-y-3 mb-4">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  roomId={roomId}
                  participants={participants}
                  assignedIds={getItemAssignments(item.id)}
                />
              ))}
            </ul>
          )}

          <form ref={formRef} action={handleAddItem} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                name="name"
                placeholder="Item name"
                required
                className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                required
                className="w-24 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <input
                type="number"
                name="quantity"
                defaultValue="1"
                min="1"
                className="w-16 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                name="category"
                placeholder="Category (optional)"
                className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm py-2"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-xl shrink-0"
              >
                Add Item
              </button>
            </div>
          </form>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
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
}

function ItemRow({ item, roomId, participants, assignedIds }: ItemRowProps) {
  const [localAssigned, setLocalAssigned] = useState<string[]>(assignedIds);
  const [isExpanded, setIsExpanded] = useState(false);

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
    <li className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">
              {item.name}
            </span>
            {item.quantity > 1 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                x{item.quantity}
              </span>
            )}
            {item.category && (
              <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                {item.category}
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {localAssigned.length === 0 ? (
              <span className="text-orange-500">Not assigned</span>
            ) : localAssigned.length === participants.length ? (
              <span>Split by all ({participants.length})</span>
            ) : (
              <span>Split by {localAssigned.length}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            ${totalCost.toFixed(2)}
          </span>

          <form
            action={removeItemAction}
            onClick={(e) => e.stopPropagation()}
          >
            <input type="hidden" name="roomId" value={roomId} />
            <input type="hidden" name="itemId" value={item.id} />
            <button
              type="submit"
              className="text-gray-400 hover:text-red-500 p-1"
              title="Remove"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>

          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-600">
          <div className="flex gap-2 mt-3 mb-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Select all
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {participants.map((participant) => (
              <label
                key={participant.id}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={localAssigned.includes(participant.id)}
                  onChange={(e) => handleCheckboxChange(participant.id, e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
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
