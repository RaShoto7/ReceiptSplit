import { Pool, PoolConfig } from 'pg';
import { Room, Participant, Item, ItemAssignment, Currency, TipTaxType } from '@/types';

// Create a connection pool
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    // Prefer non-pooling URL for serverless (better for Supabase)
    let connectionString =
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('Database not configured. Please set POSTGRES_URL or DATABASE_URL.');
    }

    // Remove any existing sslmode from URL to avoid conflicts
    connectionString = connectionString.replace(/[?&]sslmode=[^&]*/g, '');
    // Clean up double && or trailing ?
    connectionString = connectionString.replace(/\?&/, '?').replace(/[?&]$/, '');

    const config: PoolConfig = {
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false,
      },
    };

    pool = new Pool(config);

    // Log connection errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
}

// Check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!(
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL
  );
}

// Track if tables have been initialized
let tablesInitialized = false;

// Initialize database tables
export async function initializeDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error('Database not configured. Please set up your Postgres database.');
  }

  if (tablesInitialized) {
    return;
  }

  const db = getPool();

  try {
    // Test connection first
    await db.query('SELECT 1');

    await db.query(`
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
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id VARCHAR(36) PRIMARY KEY,
        room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        is_payer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
        id VARCHAR(36) PRIMARY KEY,
        room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        category VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS item_assignments (
        item_id VARCHAR(36) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        participant_id VARCHAR(36) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        PRIMARY KEY (item_id, participant_id)
      )
    `);

    tablesInitialized = true;
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Room operations
export async function createRoom(id: string, currency: Currency, title?: string): Promise<Room> {
  const db = getPool();
  const result = await db.query(
    'INSERT INTO rooms (id, title, currency) VALUES ($1, $2, $3) RETURNING *',
    [id, title || null, currency]
  );
  return result.rows[0] as Room;
}

export async function getRoom(id: string): Promise<Room | null> {
  const db = getPool();
  const result = await db.query('SELECT * FROM rooms WHERE id = $1', [id]);
  return result.rows[0] as Room | null;
}

export async function updateRoomTipTax(
  roomId: string,
  tipType: TipTaxType,
  tipValue: number,
  taxType: TipTaxType,
  taxValue: number
): Promise<void> {
  const db = getPool();
  await db.query(
    'UPDATE rooms SET tip_type = $1, tip_value = $2, tax_type = $3, tax_value = $4 WHERE id = $5',
    [tipType, tipValue, taxType, taxValue, roomId]
  );
}

// Participant operations
export async function getParticipants(roomId: string): Promise<Participant[]> {
  const db = getPool();
  const result = await db.query(
    'SELECT * FROM participants WHERE room_id = $1 ORDER BY created_at ASC',
    [roomId]
  );
  return result.rows as Participant[];
}

export async function addParticipant(id: string, roomId: string, name: string): Promise<Participant> {
  const db = getPool();
  const result = await db.query(
    'INSERT INTO participants (id, room_id, name) VALUES ($1, $2, $3) RETURNING *',
    [id, roomId, name]
  );
  return result.rows[0] as Participant;
}

export async function removeParticipant(id: string): Promise<void> {
  const db = getPool();
  await db.query('DELETE FROM participants WHERE id = $1', [id]);
}

export async function setPayerStatus(participantId: string, isPayer: boolean, roomId: string): Promise<void> {
  const db = getPool();
  if (isPayer) {
    await db.query('UPDATE participants SET is_payer = FALSE WHERE room_id = $1', [roomId]);
  }
  await db.query('UPDATE participants SET is_payer = $1 WHERE id = $2', [isPayer, participantId]);
}

// Item operations
export async function getItems(roomId: string): Promise<Item[]> {
  const db = getPool();
  const result = await db.query(
    'SELECT * FROM items WHERE room_id = $1 ORDER BY created_at ASC',
    [roomId]
  );
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
  const db = getPool();
  const result = await db.query(
    'INSERT INTO items (id, room_id, name, amount, quantity, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [id, roomId, name, amount, quantity, category || null]
  );
  return result.rows[0] as Item;
}

export async function updateItem(
  id: string,
  name: string,
  amount: number,
  quantity: number,
  category?: string
): Promise<void> {
  const db = getPool();
  await db.query(
    'UPDATE items SET name = $1, amount = $2, quantity = $3, category = $4 WHERE id = $5',
    [name, amount, quantity, category || null, id]
  );
}

export async function removeItem(id: string): Promise<void> {
  const db = getPool();
  await db.query('DELETE FROM items WHERE id = $1', [id]);
}

// Assignment operations
export async function getAssignments(roomId: string): Promise<ItemAssignment[]> {
  const db = getPool();
  const result = await db.query(`
    SELECT ia.item_id, ia.participant_id
    FROM item_assignments ia
    JOIN items i ON ia.item_id = i.id
    WHERE i.room_id = $1
  `, [roomId]);
  return result.rows as ItemAssignment[];
}

export async function setItemAssignments(itemId: string, participantIds: string[]): Promise<void> {
  const db = getPool();
  await db.query('DELETE FROM item_assignments WHERE item_id = $1', [itemId]);

  for (const participantId of participantIds) {
    await db.query(
      'INSERT INTO item_assignments (item_id, participant_id) VALUES ($1, $2)',
      [itemId, participantId]
    );
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
