import { sql } from '@vercel/postgres';
import { Room, Participant, Item, ItemAssignment, Currency, TipTaxType } from '@/types';

// Check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

// Track if tables have been initialized
let tablesInitialized = false;

// Initialize database tables
export async function initializeDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error('Database not configured. Please set up Vercel Postgres and link it to your project.');
  }

  if (tablesInitialized) {
    return;
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(10) PRIMARY KEY,
        title VARCHAR(255),
        currency VARCHAR(3) NOT NULL DEFAULT 'USD',
        tip_type VARCHAR(10) NOT NULL DEFAULT 'none',
        tip_value DECIMAL(10,2) NOT NULL DEFAULT 0,
        tax_type VARCHAR(10) NOT NULL DEFAULT 'none',
        tax_value DECIMAL(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS participants (
        id VARCHAR(36) PRIMARY KEY,
        room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        is_payer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id VARCHAR(36) PRIMARY KEY,
        room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        category VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS item_assignments (
        item_id VARCHAR(36) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        participant_id VARCHAR(36) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, participant_id)
      )
    `;

    tablesInitialized = true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Room operations
export async function createRoom(id: string, currency: Currency, title?: string): Promise<Room> {
  const result = await sql`
    INSERT INTO rooms (id, title, currency)
    VALUES (${id}, ${title || null}, ${currency})
    RETURNING *
  `;
  return result.rows[0] as Room;
}

export async function getRoom(id: string): Promise<Room | null> {
  const result = await sql`SELECT * FROM rooms WHERE id = ${id}`;
  return result.rows[0] as Room | null;
}

export async function updateRoomTipTax(
  roomId: string,
  tipType: TipTaxType,
  tipValue: number,
  taxType: TipTaxType,
  taxValue: number
): Promise<void> {
  await sql`
    UPDATE rooms
    SET tip_type = ${tipType}, tip_value = ${tipValue}, tax_type = ${taxType}, tax_value = ${taxValue}
    WHERE id = ${roomId}
  `;
}

// Participant operations
export async function getParticipants(roomId: string): Promise<Participant[]> {
  const result = await sql`
    SELECT * FROM participants WHERE room_id = ${roomId} ORDER BY created_at ASC
  `;
  return result.rows as Participant[];
}

export async function addParticipant(id: string, roomId: string, name: string): Promise<Participant> {
  const result = await sql`
    INSERT INTO participants (id, room_id, name)
    VALUES (${id}, ${roomId}, ${name})
    RETURNING *
  `;
  return result.rows[0] as Participant;
}

export async function removeParticipant(id: string): Promise<void> {
  await sql`DELETE FROM participants WHERE id = ${id}`;
}

export async function setPayerStatus(participantId: string, isPayer: boolean, roomId: string): Promise<void> {
  // First, clear all payers in the room if setting a new payer
  if (isPayer) {
    await sql`UPDATE participants SET is_payer = FALSE WHERE room_id = ${roomId}`;
  }
  await sql`UPDATE participants SET is_payer = ${isPayer} WHERE id = ${participantId}`;
}

// Item operations
export async function getItems(roomId: string): Promise<Item[]> {
  const result = await sql`
    SELECT * FROM items WHERE room_id = ${roomId} ORDER BY created_at ASC
  `;
  return result.rows as Item[];
}

export async function addItem(
  id: string,
  roomId: string,
  name: string,
  amount: number,
  quantity: number,
  category?: string
): Promise<Item> {
  const result = await sql`
    INSERT INTO items (id, room_id, name, amount, quantity, category)
    VALUES (${id}, ${roomId}, ${name}, ${amount}, ${quantity}, ${category || null})
    RETURNING *
  `;
  return result.rows[0] as Item;
}

export async function updateItem(
  id: string,
  name: string,
  amount: number,
  quantity: number,
  category?: string
): Promise<void> {
  await sql`
    UPDATE items
    SET name = ${name}, amount = ${amount}, quantity = ${quantity}, category = ${category || null}
    WHERE id = ${id}
  `;
}

export async function removeItem(id: string): Promise<void> {
  await sql`DELETE FROM items WHERE id = ${id}`;
}

// Assignment operations
export async function getAssignments(roomId: string): Promise<ItemAssignment[]> {
  const result = await sql`
    SELECT ia.item_id, ia.participant_id
    FROM item_assignments ia
    JOIN items i ON ia.item_id = i.id
    WHERE i.room_id = ${roomId}
  `;
  return result.rows as ItemAssignment[];
}

export async function setItemAssignments(itemId: string, participantIds: string[]): Promise<void> {
  // Clear existing assignments
  await sql`DELETE FROM item_assignments WHERE item_id = ${itemId}`;

  // Add new assignments
  for (const participantId of participantIds) {
    await sql`
      INSERT INTO item_assignments (item_id, participant_id)
      VALUES (${itemId}, ${participantId})
    `;
  }
}

// Get full room data
export async function getFullRoomData(roomId: string) {
  const room = await getRoom(roomId);
  if (!room) return null;

  const [participants, items, assignments] = await Promise.all([
    getParticipants(roomId),
    getItems(roomId),
    getAssignments(roomId),
  ]);

  return { room, participants, items, assignments };
}
