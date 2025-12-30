import { notFound, redirect } from 'next/navigation';
import { getFullRoomData, initializeDatabase, isDatabaseConfigured } from '@/lib/db';
import { RoomClient } from '@/components/RoomClient';

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

  const { room, participants, items, payments, photos } = data;

  return (
    <RoomClient
      initialRoom={room}
      initialParticipants={participants}
      initialItems={items}
      initialPayments={payments}
      initialPhotos={photos}
    />
  );
}
