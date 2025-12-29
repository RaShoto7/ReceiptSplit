'use client';

import { createClient, RealtimeChannel } from '@supabase/supabase-js';

// Create a singleton Supabase client for browser
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured for realtime');
    return null;
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return supabaseClient;
}

// Subscribe to room changes
export function subscribeToRoom(
  roomId: string,
  onUpdate: () => void
): RealtimeChannel | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const channel = supabase
    .channel(`room:${roomId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'participants',
        filter: `room_id=eq.${roomId}`,
      },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'items',
        filter: `room_id=eq.${roomId}`,
      },
      () => onUpdate()
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `room_id=eq.${roomId}`,
      },
      () => onUpdate()
    )
    .subscribe();

  return channel;
}

// Unsubscribe from room
export function unsubscribeFromRoom(channel: RealtimeChannel | null) {
  if (channel) {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.removeChannel(channel);
    }
  }
}
