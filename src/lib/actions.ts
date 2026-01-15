'use server';

import { nanoid } from 'nanoid';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createRoom as dbCreateRoom,
  addParticipant as dbAddParticipant,
  removeParticipant as dbRemoveParticipant,
  addItem as dbAddItem,
  removeItem as dbRemoveItem,
  addPayment as dbAddPayment,
  removePayment as dbRemovePayment,
  addPhoto as dbAddPhoto,
  removePhoto as dbRemovePhoto,
  updateRoomStatus as dbUpdateRoomStatus,
  updateRoomTipTax as dbUpdateRoomTipTax,
  updateRoomBackground as dbUpdateRoomBackground,
  deleteRoom as dbDeleteRoom,
  getParticipantBySession,
  initializeDatabase,
  linkRoomToUser,
} from './db';
import { Currency, RoomStatus } from '@/types';
import { auth } from './auth';

// Generate short room ID
function generateRoomId(): string {
  return nanoid(8);
}

// Create a new room and join as creator
export async function createRoomAction(formData: FormData) {
  await initializeDatabase();

  const title = formData.get('title') as string;
  const currency = (formData.get('currency') as Currency) || 'EUR';
  const creatorName = formData.get('creatorName') as string;
  const sessionToken = formData.get('sessionToken') as string;

  if (!creatorName || !creatorName.trim()) {
    return { error: 'Name is required' };
  }

  if (!sessionToken) {
    return { error: 'Session token is required' };
  }

  const roomId = generateRoomId();

  // Create the room
  await dbCreateRoom(roomId, currency, sessionToken, title || undefined);

  // Link room to user if logged in
  try {
    const session = await auth();
    if (session?.user?.id) {
      await linkRoomToUser(roomId, session.user.id);
    }
  } catch {
    // User not logged in, continue without linking
  }

  // Add the creator as first participant
  const participantId = nanoid();
  await dbAddParticipant(participantId, roomId, creatorName.trim(), sessionToken, true);

  redirect(`/r/${roomId}`);
}

// Join a room as a participant
export async function joinRoomAction(formData: FormData) {
  const roomId = formData.get('roomId') as string;
  const name = formData.get('name') as string;
  const sessionToken = formData.get('sessionToken') as string;

  if (!name || !name.trim()) {
    return { error: 'Name is required' };
  }

  if (!sessionToken) {
    return { error: 'Session token is required' };
  }

  // Check if already joined
  const existing = await getParticipantBySession(roomId, sessionToken);
  if (existing) {
    return { error: 'already_joined', participantId: existing.id };
  }

  const participantId = nanoid();
  await dbAddParticipant(participantId, roomId, name.trim(), sessionToken, false);

  revalidatePath(`/r/${roomId}`);
  return { success: true, participantId };
}

// Add an item (linked to the participant who adds it)
export async function addItemAction(formData: FormData) {
  const roomId = formData.get('roomId') as string;
  const name = formData.get('name') as string;
  const price = parseFloat(formData.get('price') as string);
  const quantity = parseInt(formData.get('quantity') as string) || 1;
  const participantId = formData.get('participantId') as string;

  if (!name || !name.trim()) {
    return { error: 'Item name is required' };
  }

  if (isNaN(price) || price <= 0) {
    return { error: 'Valid price is required' };
  }

  if (!participantId) {
    return { error: 'Participant ID is required' };
  }

  const itemId = nanoid();
  await dbAddItem(itemId, roomId, name.trim(), price, quantity, participantId);

  revalidatePath(`/r/${roomId}`);
  return { success: true, itemId };
}

// Remove an item
export async function removeItemAction(formData: FormData): Promise<void> {
  const itemId = formData.get('itemId') as string;
  const roomId = formData.get('roomId') as string;

  await dbRemoveItem(itemId);

  revalidatePath(`/r/${roomId}`);
}

// Remove a participant
export async function removeParticipantAction(formData: FormData): Promise<void> {
  const participantId = formData.get('participantId') as string;
  const roomId = formData.get('roomId') as string;

  await dbRemoveParticipant(participantId);

  revalidatePath(`/r/${roomId}`);
}

// Mark item as paid by a participant
export async function payItemAction(formData: FormData) {
  const roomId = formData.get('roomId') as string;
  const itemId = formData.get('itemId') as string;
  const participantId = formData.get('participantId') as string;
  const amount = parseFloat(formData.get('amount') as string);

  if (!itemId || !participantId || isNaN(amount)) {
    return { error: 'Invalid payment data' };
  }

  const paymentId = nanoid();
  await dbAddPayment(paymentId, roomId, itemId, participantId, amount);

  revalidatePath(`/r/${roomId}`);
  return { success: true };
}

// Remove a payment
export async function removePaymentAction(formData: FormData): Promise<void> {
  const paymentId = formData.get('paymentId') as string;
  const roomId = formData.get('roomId') as string;

  await dbRemovePayment(paymentId);

  revalidatePath(`/r/${roomId}`);
}

// Update room status (active -> paying -> closed)
export async function updateRoomStatusAction(formData: FormData): Promise<void> {
  const roomId = formData.get('roomId') as string;
  const status = formData.get('status') as RoomStatus;

  await dbUpdateRoomStatus(roomId, status);

  revalidatePath(`/r/${roomId}`);
}

// Update tip and tax percentages
export async function updateTipTaxAction(formData: FormData): Promise<void> {
  const roomId = formData.get('roomId') as string;
  const tipPercent = parseFloat(formData.get('tipPercent') as string) || 0;
  const taxPercent = parseFloat(formData.get('taxPercent') as string) || 0;

  await dbUpdateRoomTipTax(roomId, tipPercent, taxPercent);

  revalidatePath(`/r/${roomId}`);
}

// Add a photo to "Nos Moments"
export async function addPhotoAction(formData: FormData) {
  const roomId = formData.get('roomId') as string;
  const participantId = formData.get('participantId') as string;
  const imageData = formData.get('imageData') as string;
  const caption = formData.get('caption') as string | null;

  if (!imageData) {
    return { error: 'Image data is required' };
  }

  if (!participantId) {
    return { error: 'Participant ID is required' };
  }

  // Check size (limit to ~1MB base64)
  if (imageData.length > 1.5 * 1024 * 1024) {
    return { error: 'Image too large. Please choose a smaller image.' };
  }

  const photoId = nanoid();
  await dbAddPhoto(photoId, roomId, participantId, imageData, caption || null);

  revalidatePath(`/r/${roomId}`);
  return { success: true, photoId };
}

// Remove a photo
export async function removePhotoAction(formData: FormData): Promise<void> {
  const photoId = formData.get('photoId') as string;
  const roomId = formData.get('roomId') as string;

  await dbRemovePhoto(photoId);

  revalidatePath(`/r/${roomId}`);
}

// Update room background (creator only)
export async function updateRoomBackgroundAction(formData: FormData) {
  const roomId = formData.get('roomId') as string;
  const backgroundImage = formData.get('backgroundImage') as string | null;

  // Limit size to ~2MB base64
  if (backgroundImage && backgroundImage.length > 2.5 * 1024 * 1024) {
    return { error: 'Image too large. Please choose an image under 2MB.' };
  }

  await dbUpdateRoomBackground(roomId, backgroundImage || null);

  revalidatePath(`/r/${roomId}`);
  return { success: true };
}

// Close/Delete room (creator only)
export async function closeRoomAction(formData: FormData) {
  const roomId = formData.get('roomId') as string;

  await dbDeleteRoom(roomId);

  redirect('/');
}
