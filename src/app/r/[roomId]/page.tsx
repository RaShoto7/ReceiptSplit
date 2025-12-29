import { notFound, redirect } from 'next/navigation';
import { getFullRoomData, initializeDatabase, isDatabaseConfigured } from '@/lib/db';
import { calculateParticipantTotals, calculateSettlements } from '@/lib/calculations';
import { RoomHeader } from '@/components/RoomHeader';
import { ParticipantsList } from '@/components/ParticipantsList';
import { ItemsList } from '@/components/ItemsList';
import { TipTaxSettings } from '@/components/TipTaxSettings';
import { ResultsSummary } from '@/components/ResultsSummary';

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: PageProps) {
  // Check if database is configured
  if (!isDatabaseConfigured()) {
    redirect('/');
  }

  const { roomId } = await params;

  await initializeDatabase();
  const data = await getFullRoomData(roomId);

  if (!data) {
    notFound();
  }

  const { room, participants, items, assignments } = data;

  const totals = calculateParticipantTotals(room, participants, items, assignments);
  const settlements = calculateSettlements(participants, totals);

  return (
    <div className="space-y-6 pb-8">
      <RoomHeader room={room} />

      <ParticipantsList
        roomId={roomId}
        participants={participants}
      />

      <ItemsList
        roomId={roomId}
        items={items}
        participants={participants}
        assignments={assignments}
        currency={room.currency}
      />

      <TipTaxSettings room={room} />

      <ResultsSummary
        room={room}
        participants={participants}
        totals={totals}
        settlements={settlements}
      />
    </div>
  );
}
