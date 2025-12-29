'use client';

import { Participant } from '@/types';
import { addParticipantAction, removeParticipantAction, setPayerAction } from '@/lib/actions';
import { useLanguage } from '@/lib/language';
import { useState, useRef } from 'react';

interface ParticipantsListProps {
  roomId: string;
  participants: Participant[];
}

export function ParticipantsList({ roomId, participants }: ParticipantsListProps) {
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useLanguage();

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get('name') as string;

    if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError(`"${name}" ${t.alreadyInGroup}`);
      return;
    }

    setError(null);
    formData.set('roomId', roomId);
    await addParticipantAction(formData);
    formRef.current?.reset();
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm overflow-hidden animate-fade-in-up stagger-1">
      <div className="p-5 pb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t.people}
        </h2>
      </div>

      {participants.length === 0 ? (
        <p className="text-gray-400 dark:text-gray-500 text-sm px-5 pb-4">
          {t.addPeoplePlaceholder}
        </p>
      ) : (
        <ul className="mb-2">
          {participants.map((participant, index) => (
            <li
              key={participant.id}
              className="flex items-center justify-between py-3 px-5 border-b border-gray-100 dark:border-gray-800 last:border-0"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {participant.name}
                  </span>
                  {participant.is_payer && (
                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                      {t.payer}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <form action={setPayerAction}>
                  <input type="hidden" name="roomId" value={roomId} />
                  <input type="hidden" name="participantId" value={participant.id} />
                  <input type="hidden" name="isPayer" value={participant.is_payer ? 'false' : 'true'} />
                  <button
                    type="submit"
                    className="text-xs text-blue-500 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {participant.is_payer ? t.removePayer : t.setPayer}
                  </button>
                </form>

                <form action={removeParticipantAction}>
                  <input type="hidden" name="roomId" value={roomId} />
                  <input type="hidden" name="participantId" value={participant.id} />
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-800">
        <form ref={formRef} action={handleSubmit} className="flex gap-2">
          <input
            type="text"
            name="name"
            placeholder={t.addPersonPlaceholder}
            required
            onChange={() => setError(null)}
            className="flex-1"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-5 rounded-xl shrink-0"
          >
            {t.add}
          </button>
        </form>

        {error && (
          <p className="text-red-500 text-sm mt-2 px-1">{error}</p>
        )}
      </div>
    </div>
  );
}
