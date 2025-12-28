'use server';

import { nanoid } from 'nanoid';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createRoom as dbCreateRoom,
  addParticipant as dbAddParticipant,
  removeParticipant as dbRemoveParticipant,
  setPayerStatus as dbSetPayerStatus,
  addItem as dbAddItem,
  removeItem as dbRemoveItem,
  setItemAssignments as dbSetItemAssignments,
  updateRoomTipTax as dbUpdateRoomTipTax,
  initializeDatabase,
} from './db';
import { Currency, TipTaxType } from '@/types';

// Generate short room ID
function generateRoomId(): string {
  return nanoid(8);
}

// Create a new room
export async function createRoomAction(formData: FormData) {
  await initializeDatabase();

  const title = formData.get('title') as string;
  const currency = (formData.get('currency') as Currency) || 'USD';

  const roomId = generateRoomId();
  await dbCreateRoom(roomId, currency, title || undefined);

  redirect(`/r/${roomId}`);
}

// Add a participant
export async function addParticipantAction(formData: FormData) {
  const roomId = formData.get('roomId') as string;
  const name = formData.get('name') as string;

  if (!name || !name.trim()) {
    return { error: 'Name is required' };
  }

  const participantId = nanoid();
  await dbAddParticipant(participantId, roomId, name.trim());

  revalidatePath(`/r/${roomId}`);
  return { success: true };
}

// Remove a participant
export async function removeParticipantAction(formData: FormData): Promise<void> {
  const participantId = formData.get('participantId') as string;
  const roomId = formData.get('roomId') as string;

  await dbRemoveParticipant(participantId);

  revalidatePath(`/r/${roomId}`);
}

// Set payer status
export async function setPayerAction(formData: FormData): Promise<void> {
  const participantId = formData.get('participantId') as string;
  const roomId = formData.get('roomId') as string;
  const isPayer = formData.get('isPayer') === 'true';

  await dbSetPayerStatus(participantId, isPayer, roomId);

  revalidatePath(`/r/${roomId}`);
}

// Add an item
export async function addItemAction(formData: FormData) {
  const roomId = formData.get('roomId') as string;
  const name = formData.get('name') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const quantity = parseInt(formData.get('quantity') as string) || 1;
  const category = formData.get('category') as string;

  if (!name || !name.trim()) {
    return { error: 'Item name is required' };
  }

  if (isNaN(amount) || amount <= 0) {
    return { error: 'Valid amount is required' };
  }

  const itemId = nanoid();
  await dbAddItem(itemId, roomId, name.trim(), amount, quantity, category || undefined);

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

// Update item assignments
export async function updateAssignmentsAction(formData: FormData): Promise<void> {
  const itemId = formData.get('itemId') as string;
  const roomId = formData.get('roomId') as string;
  const participantIds = formData.getAll('participantIds') as string[];

  await dbSetItemAssignments(itemId, participantIds);

  revalidatePath(`/r/${roomId}`);
}

// Update tip and tax settings
export async function updateTipTaxAction(formData: FormData): Promise<void> {
  const roomId = formData.get('roomId') as string;
  const tipType = formData.get('tipType') as TipTaxType;
  const tipValue = parseFloat(formData.get('tipValue') as string) || 0;
  const taxType = formData.get('taxType') as TipTaxType;
  const taxValue = parseFloat(formData.get('taxValue') as string) || 0;

  await dbUpdateRoomTipTax(roomId, tipType, tipValue, taxType, taxValue);

  revalidatePath(`/r/${roomId}`);
}
