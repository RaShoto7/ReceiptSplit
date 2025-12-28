export type Currency = 'EUR' | 'USD' | 'GBP';
export type TipTaxType = 'percent' | 'fixed' | 'none';

export interface Room {
  id: string;
  title: string | null;
  currency: Currency;
  tip_type: TipTaxType;
  tip_value: number;
  tax_type: TipTaxType;
  tax_value: number;
  created_at: Date;
}

export interface Participant {
  id: string;
  room_id: string;
  name: string;
  is_payer: boolean;
  created_at: Date;
}

export interface Item {
  id: string;
  room_id: string;
  name: string;
  amount: number;
  quantity: number;
  category: string | null;
  created_at: Date;
}

export interface ItemAssignment {
  item_id: string;
  participant_id: string;
}

// Computed types for display
export interface ParticipantTotal {
  participantId: string;
  participantName: string;
  subtotal: number;
  tipShare: number;
  taxShare: number;
  total: number;
}

export interface Settlement {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};
