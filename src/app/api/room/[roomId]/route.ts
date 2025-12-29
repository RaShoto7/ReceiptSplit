import { NextRequest, NextResponse } from 'next/server';
import { getFullRoomData, initializeDatabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    await initializeDatabase();

    const { roomId } = await params;
    const data = await getFullRoomData(roomId);

    if (!data) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
