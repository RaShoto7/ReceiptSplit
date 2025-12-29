'use client';

import { UserSession } from '@/types';

const SESSION_KEY = 'receiptsplit-session';

// Generate a unique session token
export function generateSessionToken(): string {
  return crypto.randomUUID();
}

// Get or create session
export function getSession(): UserSession {
  if (typeof window === 'undefined') {
    return { sessionToken: '' };
  }

  const stored = localStorage.getItem(SESSION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid JSON, create new session
    }
  }

  const newSession: UserSession = {
    sessionToken: generateSessionToken(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  return newSession;
}

// Update session
export function updateSession(updates: Partial<UserSession>): UserSession {
  const current = getSession();
  const updated = { ...current, ...updates };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

// Get session for specific room
export function getRoomSession(roomId: string): UserSession | null {
  const session = getSession();
  if (session.roomId === roomId) {
    return session;
  }
  return null;
}

// Set room session (when joining a room)
export function setRoomSession(
  roomId: string,
  participantId: string,
  participantName: string
): UserSession {
  return updateSession({
    roomId,
    participantId,
    participantName,
  });
}

// Clear room from session
export function clearRoomSession(): UserSession {
  const session = getSession();
  const updated: UserSession = {
    sessionToken: session.sessionToken,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

// Check if user is the creator of a room
export function isRoomCreator(creatorSessionId: string): boolean {
  const session = getSession();
  return session.sessionToken === creatorSessionId;
}
