import { Pool, PoolConfig } from 'pg';
import { Room, Participant, Item, Payment, Currency, RoomStatus } from '@/types';

// Create a connection pool
let pool: Pool | null = null;

function parseConnectionString(urlString: string): PoolConfig {
  // Parse the URL properly to avoid any encoding issues
  try {
    // Handle postgres:// vs postgresql://
    const normalizedUrl = urlString.replace(/^postgres:\/\//, 'postgresql://');
    const url = new URL(normalizedUrl);

    const config: PoolConfig = {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1) || 'postgres', // Remove leading /
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      max: 1,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
      ssl: {
        rejectUnauthorized: false,
      },
    };

    console.log('DB Config: host=%s, port=%d, database=%s, user=%s',
      config.host, config.port, config.database, config.user);

    return config;
  } catch (error) {
    console.error('Failed to parse connection string:', error);
    throw new Error('Invalid database connection string format');
  }
}

function getPool(): Pool {
  if (!pool) {
    // Check for DATABASE_URL first (manually set), then Vercel integration vars
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_URL_NON_POOLING;

    if (!connectionString) {
      throw new Error('Database not configured. Please set DATABASE_URL or POSTGRES_URL.');
    }

    console.log('Using connection string starting with:', connectionString.substring(0, 50) + '...');

    const config = parseConnectionString(connectionString);
    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pool;
}

export function isDatabaseConfigured(): boolean {
  return !!(
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL
  );
}

let tablesInitialized = false;

export async function initializeDatabase() {
  if (!isDatabaseConfigured()) {
    throw new Error('Database not configured. Please set up your Postgres database.');
  }

  if (tablesInitialized) {
    return;
  }

  const db = getPool();

  try {
    await db.query('SELECT 1');

    // Rooms table
    await db.query(`
      CREATE TABLE IF NOT EXISTS rooms (
        id VARCHAR(10) PRIMARY KEY,
        title VARCHAR(255),
        currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        creator_session_id VARCHAR(36) NOT NULL,
        tip_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
        tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Participants table
    await db.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id VARCHAR(36) PRIMARY KEY,
        room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        session_token VARCHAR(36) NOT NULL,
        is_creator BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Items table
    await db.query(`
      CREATE TABLE IF NOT EXISTS items (
        id VARCHAR(36) PRIMARY KEY,
        room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_by_participant_id VARCHAR(36) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payments table
    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        room_id VARCHAR(10) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        item_id VARCHAR(36) NOT NULL REFERENCES items(id) ON DELETE CASCADE,
        paid_by_participant_id VARCHAR(36) NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
export async function createRoom(
  id: string,
  currency: Currency,
  creatorSessionId: string,
  title?: string
): Promise<Room> {
  const db = getPool();
  const result = await db.query(
    `INSERT INTO rooms (id, title, currency, creator_session_id, status)
     VALUES ($1, $2, $3, $4, 'active') RETURNING *`,
    [id, title || null, currency, creatorSessionId]
  );
  return result.rows[0] as Room;
}

export async function getRoom(id: string): Promise<Room | null> {
  const db = getPool();
  const result = await db.query('SELECT * FROM rooms WHERE id = $1', [id]);
  return result.rows[0] as Room | null;
}

export async function updateRoomStatus(roomId: string, status: RoomStatus): Promise<void> {
  const db = getPool();
  await db.query('UPDATE rooms SET status = $1 WHERE id = $2', [status, roomId]);
}

export async function updateRoomTipTax(
  roomId: string,
  tipPercent: number,
  taxPercent: number
): Promise<void> {
  const db = getPool();
  await db.query(
    'UPDATE rooms SET tip_percent = $1, tax_percent = $2 WHERE id = $3',
    [tipPercent, taxPercent, roomId]
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

export async function getParticipantBySession(
  roomId: string,
  sessionToken: string
): Promise<Participant | null> {
  const db = getPool();
  const result = await db.query(
    'SELECT * FROM participants WHERE room_id = $1 AND session_token = $2',
    [roomId, sessionToken]
  );
  return result.rows[0] as Participant | null;
}

export async function addParticipant(
  id: string,
  roomId: string,
  name: string,
  sessionToken: string,
  isCreator: boolean = false
): Promise<Participant> {
  const db = getPool();
  const result = await db.query(
    `INSERT INTO participants (id, room_id, name, session_token, is_creator)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, roomId, name, sessionToken, isCreator]
  );
  return result.rows[0] as Participant;
}

export async function removeParticipant(id: string): Promise<void> {
  const db = getPool();
  await db.query('DELETE FROM participants WHERE id = $1', [id]);
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
  price: number,
  quantity: number,
  createdByParticipantId: string
): Promise<Item> {
  const db = getPool();
  const result = await db.query(
    `INSERT INTO items (id, room_id, name, price, quantity, created_by_participant_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [id, roomId, name, price, quantity, createdByParticipantId]
  );
  return result.rows[0] as Item;
}

export async function removeItem(id: string): Promise<void> {
  const db = getPool();
  await db.query('DELETE FROM items WHERE id = $1', [id]);
}

// Payment operations
export async function getPayments(roomId: string): Promise<Payment[]> {
  const db = getPool();
  const result = await db.query(
    'SELECT * FROM payments WHERE room_id = $1 ORDER BY created_at ASC',
    [roomId]
  );
  return result.rows as Payment[];
}

export async function addPayment(
  id: string,
  roomId: string,
  itemId: string,
  paidByParticipantId: string,
  amount: number
): Promise<Payment> {
  const db = getPool();
  const result = await db.query(
    `INSERT INTO payments (id, room_id, item_id, paid_by_participant_id, amount)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [id, roomId, itemId, paidByParticipantId, amount]
  );
  return result.rows[0] as Payment;
}

export async function removePayment(id: string): Promise<void> {
  const db = getPool();
  await db.query('DELETE FROM payments WHERE id = $1', [id]);
}

// Get full room data
export async function getFullRoomData(roomId: string) {
  const room = await getRoom(roomId);
  if (!room) return null;

  const [participants, items, payments] = await Promise.all([
    getParticipants(roomId),
    getItems(roomId),
    getPayments(roomId),
  ]);

  return { room, participants, items, payments };
}
