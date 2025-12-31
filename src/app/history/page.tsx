import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserRooms } from '@/lib/db';
import { HistoryClient } from './HistoryClient';

export default async function HistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/history');
  }

  const rooms = await getUserRooms(session.user.id);

  return <HistoryClient rooms={rooms} userName={session.user.name || 'Utilisateur'} />;
}
