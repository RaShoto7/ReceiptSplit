export type Currency = 'EUR' | 'USD' | 'GBP';
export type TipTaxType = 'percent' | 'fixed' | 'none';
export type RoomStatus = 'active' | 'paying' | 'closed';

export interface Room {
  id: string;
  title: string | null;
  currency: Currency;
  status: RoomStatus;
  creator_session_id: string;
  tip_percent: number;
  tax_percent: number;
  created_at: string;
}

export interface Participant {
  id: string;
  room_id: string;
  name: string;
  session_token: string;
  is_creator: boolean;
  created_at: string;
}

export interface Item {
  id: string;
  room_id: string;
  name: string;
  price: number;
  quantity: number;
  created_by_participant_id: string;
  created_at: string;
}

export interface Payment {
  id: string;
  room_id: string;
  item_id: string;
  paid_by_participant_id: string;
  amount: number;
  created_at: string;
}

export interface Photo {
  id: string;
  room_id: string;
  uploaded_by_participant_id: string;
  image_data: string; // Base64 encoded image
  caption: string | null;
  created_at: string;
}

// Computed types for display
export interface ParticipantWithItems extends Participant {
  items: Item[];
  subtotal: number;
  tipAmount: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  amountOwed: number;
}

export interface ItemWithOwner extends Item {
  ownerName: string;
  isPaidFor: boolean;
  paidByName?: string;
}

export interface DebtSummary {
  participantId: string;
  participantName: string;
  totalOwed: number;      // What they owe for their items
  totalPaid: number;      // What they've paid
  netBalance: number;     // Positive = owed money, Negative = owes money
  owesTo: { name: string; amount: number }[];
  owedBy: { name: string; amount: number }[];
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

// For localStorage session
export interface UserSession {
  sessionToken: string;
  participantId?: string;
  participantName?: string;
  roomId?: string;
}
