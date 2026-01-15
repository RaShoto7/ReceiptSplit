import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserRooms, getUserItems, getUserPayments } from '@/lib/db';
import { HistoryClient } from './HistoryClient';

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/history');
  }

  const [rooms, items, payments] = await Promise.all([
    getUserRooms(session.user.id),
    getUserItems(session.user.id),
    getUserPayments(session.user.id),
  ]);

  return (
    <HistoryClient
      rooms={rooms}
      items={items}
      payments={payments}
      userName={session.user.name || 'Utilisateur'}
    />
  );
}
