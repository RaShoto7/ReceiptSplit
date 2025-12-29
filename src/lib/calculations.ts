import { Room, Participant, Item, Payment, Currency, CURRENCY_SYMBOLS } from '@/types';

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const formatted = amount.toFixed(2);

  if (currency === 'EUR') {
    return `${formatted} ${symbol}`;
  }
  return `${symbol}${formatted}`;
}

// Calculate total for an item (price * quantity)
export function getItemTotal(item: Item): number {
  return Number(item.price) * item.quantity;
}

// Calculate subtotal for a participant (sum of their items)
export function getParticipantSubtotal(
  participantId: string,
  items: Item[]
): number {
  return items
    .filter(item => item.created_by_participant_id === participantId)
    .reduce((sum, item) => sum + getItemTotal(item), 0);
}

// Calculate tip amount for a participant
export function getParticipantTip(
  subtotal: number,
  tipPercent: number
): number {
  return subtotal * (tipPercent / 100);
}

// Calculate tax amount for a participant
export function getParticipantTax(
  subtotal: number,
  taxPercent: number
): number {
  return subtotal * (taxPercent / 100);
}

// Calculate total for a participant (subtotal + tip + tax)
export function getParticipantTotal(
  participantId: string,
  items: Item[],
  tipPercent: number,
  taxPercent: number
): { subtotal: number; tip: number; tax: number; total: number } {
  const subtotal = getParticipantSubtotal(participantId, items);
  const tip = getParticipantTip(subtotal, tipPercent);
  const tax = getParticipantTax(subtotal, taxPercent);
  const total = subtotal + tip + tax;

  return { subtotal, tip, tax, total };
}

// Calculate how much a participant has paid (for others' items)
export function getAmountPaidForOthers(
  participantId: string,
  payments: Payment[],
  items: Item[]
): number {
  return payments
    .filter(p => p.paid_by_participant_id === participantId)
    .filter(p => {
      const item = items.find(i => i.id === p.item_id);
      return item && item.created_by_participant_id !== participantId;
    })
    .reduce((sum, p) => sum + Number(p.amount), 0);
}

// Calculate how much others have paid for a participant's items
export function getAmountPaidByOthers(
  participantId: string,
  payments: Payment[],
  items: Item[]
): number {
  const participantItemIds = items
    .filter(i => i.created_by_participant_id === participantId)
    .map(i => i.id);

  return payments
    .filter(p => participantItemIds.includes(p.item_id))
    .filter(p => p.paid_by_participant_id !== participantId)
    .reduce((sum, p) => sum + Number(p.amount), 0);
}

// Check if an item is fully paid
export function isItemPaid(itemId: string, payments: Payment[], items: Item[]): boolean {
  const item = items.find(i => i.id === itemId);
  if (!item) return false;

  const totalPaid = payments
    .filter(p => p.item_id === itemId)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return totalPaid >= getItemTotal(item);
}

// Get who paid for an item
export function getItemPayer(
  itemId: string,
  payments: Payment[],
  participants: Participant[]
): Participant | null {
  const payment = payments.find(p => p.item_id === itemId);
  if (!payment) return null;

  return participants.find(p => p.id === payment.paid_by_participant_id) || null;
}

// Calculate room totals
export function getRoomTotals(
  room: Room,
  participants: Participant[],
  items: Item[],
  payments: Payment[]
) {
  const subtotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);
  const tipTotal = subtotal * (Number(room.tip_percent) / 100);
  const taxTotal = subtotal * (Number(room.tax_percent) / 100);
  const grandTotal = subtotal + tipTotal + taxTotal;

  const participantSummaries = participants.map(participant => {
    const { subtotal: pSubtotal, tip, tax, total } = getParticipantTotal(
      participant.id,
      items,
      Number(room.tip_percent),
      Number(room.tax_percent)
    );

    const paidForOthers = getAmountPaidForOthers(participant.id, payments, items);
    const paidByOthers = getAmountPaidByOthers(participant.id, payments, items);

    // Net balance: positive means they're owed money, negative means they owe
    const netBalance = paidForOthers - paidByOthers;

    return {
      participant,
      subtotal: pSubtotal,
      tip,
      tax,
      total,
      paidForOthers,
      paidByOthers,
      netBalance,
      // What they still need to pay (their total minus what others paid for them)
      owes: Math.max(0, total - paidByOthers),
      // What they're owed (what they paid for others)
      owed: paidForOthers,
    };
  });

  return {
    subtotal,
    tipTotal,
    taxTotal,
    grandTotal,
    participantSummaries,
  };
}

// Calculate settlements (simplified)
export function calculateSettlements(
  participants: Participant[],
  items: Item[],
  payments: Payment[],
  tipPercent: number,
  taxPercent: number
): { from: Participant; to: Participant; amount: number }[] {
  const settlements: { from: Participant; to: Participant; amount: number }[] = [];

  // Calculate net balances for each participant
  const balances = participants.map(participant => {
    const { total } = getParticipantTotal(participant.id, items, tipPercent, taxPercent);
    const paidForOthers = getAmountPaidForOthers(participant.id, payments, items);
    const paidByOthers = getAmountPaidByOthers(participant.id, payments, items);

    // Negative = owes money, Positive = owed money
    return {
      participant,
      balance: paidForOthers - (total - paidByOthers),
    };
  });

  // Sort: those who owe (negative) first, then those owed (positive)
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(-debtor.balance, creditor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.participant,
        to: creditor.participant,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return settlements;
}
