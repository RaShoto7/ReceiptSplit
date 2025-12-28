import { Room, Participant, Item, ItemAssignment, ParticipantTotal, Settlement, TipTaxType } from '@/types';

// Calculate tip/tax amount from type and value
function calculateTipTax(subtotal: number, type: TipTaxType, value: number): number {
  if (type === 'none' || value === 0) return 0;
  if (type === 'percent') return subtotal * (value / 100);
  return value; // fixed
}

// Calculate per-participant totals
export function calculateParticipantTotals(
  room: Room,
  participants: Participant[],
  items: Item[],
  assignments: ItemAssignment[]
): ParticipantTotal[] {
  // Create a map of item costs per participant
  const participantSubtotals = new Map<string, number>();

  // Initialize all participants with 0
  participants.forEach(p => participantSubtotals.set(p.id, 0));

  // Calculate each participant's share of each item
  items.forEach(item => {
    const itemAssignments = assignments.filter(a => a.item_id === item.id);
    if (itemAssignments.length === 0) return; // Item not assigned to anyone

    const totalItemCost = Number(item.amount) * item.quantity;
    const costPerPerson = totalItemCost / itemAssignments.length;

    itemAssignments.forEach(assignment => {
      const current = participantSubtotals.get(assignment.participant_id) || 0;
      participantSubtotals.set(assignment.participant_id, current + costPerPerson);
    });
  });

  // Calculate grand subtotal for proportional tip/tax
  const grandSubtotal = Array.from(participantSubtotals.values()).reduce((sum, v) => sum + v, 0);

  // Calculate total tip and tax
  const totalTip = calculateTipTax(grandSubtotal, room.tip_type as TipTaxType, Number(room.tip_value));
  const totalTax = calculateTipTax(grandSubtotal, room.tax_type as TipTaxType, Number(room.tax_value));

  // Build result array with proportional tip/tax
  return participants.map(p => {
    const subtotal = participantSubtotals.get(p.id) || 0;
    const proportion = grandSubtotal > 0 ? subtotal / grandSubtotal : 0;
    const tipShare = totalTip * proportion;
    const taxShare = totalTax * proportion;

    return {
      participantId: p.id,
      participantName: p.name,
      subtotal,
      tipShare,
      taxShare,
      total: subtotal + tipShare + taxShare,
    };
  });
}

// Calculate simplified settlement (who owes who)
export function calculateSettlements(
  participants: Participant[],
  totals: ParticipantTotal[]
): Settlement[] {
  // Find designated payer
  const payer = participants.find(p => p.is_payer);

  if (payer) {
    // Simple case: everyone pays the payer
    return totals
      .filter(t => t.participantId !== payer.id && t.total > 0.01)
      .map(t => ({
        from: t.participantId,
        fromName: t.participantName,
        to: payer.id,
        toName: payer.name,
        amount: t.total,
      }));
  }

  // Complex case: minimize transfers using greedy algorithm
  // Each person's "balance" is their total (what they owe)
  // minus their equal share of the grand total

  const grandTotal = totals.reduce((sum, t) => sum + t.total, 0);
  const equalShare = grandTotal / participants.length;

  // Create balance array: positive = owes money, negative = is owed money
  const balances = totals.map(t => ({
    id: t.participantId,
    name: t.participantName,
    balance: t.total - equalShare,
  }));

  const settlements: Settlement[] = [];
  const debtors = balances.filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);
  const creditors = balances.filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];

    const amount = Math.min(debtor.balance, -creditor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.id,
        fromName: debtor.name,
        to: creditor.id,
        toName: creditor.name,
        amount,
      });
    }

    debtor.balance -= amount;
    creditor.balance += amount;

    if (debtor.balance < 0.01) debtorIndex++;
    if (creditor.balance > -0.01) creditorIndex++;
  }

  return settlements;
}

// Format currency
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    EUR: '€',
    USD: '$',
    GBP: '£',
  };
  const symbol = symbols[currency] || '$';
  return `${symbol}${amount.toFixed(2)}`;
}
