'use client';

import { Participant } from '@/types';
import { addParticipantAction, removeParticipantAction, setPayerAction } from '@/lib/actions';
import { useState, useRef } from 'react';

interface ParticipantsListProps {
  roomId: string;
  participants: Participant[];
}

export function ParticipantsList({ roomId, participants }: ParticipantsListProps) {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get('name') as string;

    // Check for duplicate names
    if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError(`"${name}" is already in the group`);
      return;
    }

    setError(null);
    formData.set('roomId', roomId);
    await addParticipantAction(formData);
    formRef.current?.reset();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        People
      </h2>

      {participants.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
          Add people to split the bill with
        </p>
      ) : (
        <ul className="space-y-2 mb-4">
          {participants.map((participant) => (
            <li
              key={participant.id}
              className="flex items-center justify-between py-2.5 px-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium text-sm">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {participant.name}
                </span>
                {participant.is_payer && (
                  <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                    Payer
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <form action={setPayerAction}>
                  <input type="hidden" name="roomId" value={roomId} />
                  <input type="hidden" name="participantId" value={participant.id} />
                  <input
                    type="hidden"
                    name="isPayer"
                    value={participant.is_payer ? 'false' : 'true'}
                  />
                  <button
                    type="submit"
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-1"
                    title={participant.is_payer ? 'Remove as payer' : 'Set as payer'}
                  >
                    {participant.is_payer ? 'Remove payer' : 'Set payer'}
                  </button>
                </form>

                <form action={removeParticipantAction}>
                  <input type="hidden" name="roomId" value={roomId} />
                  <input type="hidden" name="participantId" value={participant.id} />
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
              </div>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={handleSubmit} className="flex gap-2">
        <input
          type="text"
          name="name"
          placeholder="Add person..."
          required
          className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          onChange={() => setError(null)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-5 rounded-xl shrink-0"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
