'use client';

import { useState, useEffect, useCallback } from 'react';
import { Room, Participant, Item, Payment, Currency, CURRENCY_SYMBOLS } from '@/types';
import { useLanguage } from '@/lib/language';
import { getSession, setRoomSession, getRoomSession } from '@/lib/session';
import { subscribeToRoom, unsubscribeFromRoom } from '@/lib/supabase';
import {
  joinRoomAction,
  addItemAction,
  removeItemAction,
  updateRoomStatusAction,
  updateTipTaxAction,
  payItemAction
} from '@/lib/actions';
import { formatCurrency, getItemTotal, getParticipantTotal, getRoomTotals } from '@/lib/calculations';
import { SettingsButton } from './SettingsModal';

interface RoomClientProps {
  initialRoom: Room;
  initialParticipants: Participant[];
  initialItems: Item[];
  initialPayments: Payment[];
}

export function RoomClient({
  initialRoom,
  initialParticipants,
  initialItems,
  initialPayments,
}: RoomClientProps) {
  const { t } = useLanguage();
  const [room, setRoom] = useState(initialRoom);
  const [participants, setParticipants] = useState(initialParticipants);
  const [items, setItems] = useState(initialItems);
  const [payments, setPayments] = useState(initialPayments);

  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [copied, setCopied] = useState(false);

  // Add item form
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Tip/Tax
  const [tipPercent, setTipPercent] = useState(String(room.tip_percent || 0));
  const [taxPercent, setTaxPercent] = useState(String(room.tax_percent || 0));
  const [isSavingTipTax, setIsSavingTipTax] = useState(false);

  const currency = room.currency as Currency;
  const isCreator = currentParticipant?.is_creator || false;

  // Check if user already joined
  useEffect(() => {
    const session = getSession();
    const existing = participants.find(p => p.session_token === session.sessionToken);
    if (existing) {
      setCurrentParticipant(existing);
      setRoomSession(room.id, existing.id, existing.name);
    }
  }, [participants, room.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = subscribeToRoom(room.id, async () => {
      // Refetch data when changes occur
      try {
        const res = await fetch(`/api/room/${room.id}`);
        if (res.ok) {
          const data = await res.json();
          setRoom(data.room);
          setParticipants(data.participants);
          setItems(data.items);
          setPayments(data.payments);
        }
      } catch (err) {
        console.error('Failed to refresh room data:', err);
      }
    });

    return () => {
      unsubscribeFromRoom(channel);
    };
  }, [room.id]);

  // Join room
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim()) return;

    setIsJoining(true);
    const session = getSession();

    const formData = new FormData();
    formData.set('roomId', room.id);
    formData.set('name', joinName.trim());
    formData.set('sessionToken', session.sessionToken);

    const result = await joinRoomAction(formData);

    if (result?.error === 'already_joined') {
      const existing = participants.find(p => p.id === result.participantId);
      if (existing) {
        setCurrentParticipant(existing);
        setRoomSession(room.id, existing.id, existing.name);
      }
    } else if (result?.success && result?.participantId) {
      setRoomSession(room.id, result.participantId, joinName.trim());
      // Reload to get updated participant list
      window.location.reload();
    }

    setIsJoining(false);
  };

  // Add item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentParticipant || !itemName.trim() || !itemPrice) return;

    setIsAddingItem(true);

    const formData = new FormData();
    formData.set('roomId', room.id);
    formData.set('name', itemName.trim());
    formData.set('price', itemPrice);
    formData.set('quantity', itemQuantity || '1');
    formData.set('participantId', currentParticipant.id);

    await addItemAction(formData);

    setItemName('');
    setItemPrice('');
    setItemQuantity('1');
    setIsAddingItem(false);

    // Refetch
    window.location.reload();
  };

  // Remove item
  const handleRemoveItem = async (itemId: string) => {
    const formData = new FormData();
    formData.set('itemId', itemId);
    formData.set('roomId', room.id);
    await removeItemAction(formData);
    window.location.reload();
  };

  // Finalize bill (switch to paying mode)
  const handleFinalize = async () => {
    const formData = new FormData();
    formData.set('roomId', room.id);
    formData.set('status', 'paying');
    await updateRoomStatusAction(formData);
    window.location.reload();
  };

  // Save tip/tax
  const handleSaveTipTax = async () => {
    setIsSavingTipTax(true);
    const formData = new FormData();
    formData.set('roomId', room.id);
    formData.set('tipPercent', tipPercent);
    formData.set('taxPercent', taxPercent);
    await updateTipTaxAction(formData);
    setIsSavingTipTax(false);
    window.location.reload();
  };

  // Pay for item
  const handlePayItem = async (itemId: string, amount: number) => {
    if (!currentParticipant) return;

    const formData = new FormData();
    formData.set('roomId', room.id);
    formData.set('itemId', itemId);
    formData.set('participantId', currentParticipant.id);
    formData.set('amount', String(amount));
    await payItemAction(formData);
    window.location.reload();
  };

  // Copy link
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Get my items
  const myItems = currentParticipant
    ? items.filter(i => i.created_by_participant_id === currentParticipant.id)
    : [];

  // Get totals
  const totals = currentParticipant
    ? getParticipantTotal(currentParticipant.id, items, Number(room.tip_percent), Number(room.tax_percent))
    : { subtotal: 0, tip: 0, tax: 0, total: 0 };

  // Room totals
  const roomTotals = getRoomTotals(room, participants, items, payments);

  // If not joined, show join form
  if (!currentParticipant) {
    return (
      <main className="min-h-screen bg-[#f2f2f7] dark:bg-black p-4">
        <SettingsButton />
        <div className="max-w-md mx-auto pt-20">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {room.title || t.untitledBill}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {participants.length} {t.participants}
            </p>
          </div>

          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up stagger-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t.joinBill}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {t.enterYourName}
            </p>

            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder={t.joinPlaceholder}
                required
                className="w-full px-4 py-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] border-0 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isJoining}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all"
              >
                {isJoining ? t.joining : t.join}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // Main room view
  return (
    <main className="min-h-screen bg-[#f2f2f7] dark:bg-black pb-24">
      <SettingsButton />

      {/* Header */}
      <header className="bg-white dark:bg-[#1c1c1e] pt-12 pb-6 px-4 rounded-b-3xl shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {room.title || t.untitledBill}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {participants.length} {t.participants}
              </p>
            </div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-medium transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t.copied}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {t.share}
                </>
              )}
            </button>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              room.status === 'active'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : room.status === 'paying'
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {room.status === 'active' ? t.statusActive : room.status === 'paying' ? t.statusPaying : t.statusClosed}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t.you}: {currentParticipant.name} {isCreator && `(${t.creator})`}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Active phase - Add items */}
        {room.status === 'active' && (
          <>
            {/* My Items */}
            <section className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.myItems}
              </h2>

              {myItems.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
                  {t.addYourFirstItem}
                </p>
              ) : (
                <div className="space-y-2 mb-4">
                  {myItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                        {item.quantity > 1 && (
                          <span className="text-gray-400 dark:text-gray-500 text-sm ml-2">x{item.quantity}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(getItemTotal(item), currency)}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add item form */}
              <form onSubmit={handleAddItem} className="space-y-3">
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder={t.itemNamePlaceholder}
                  className="w-full px-4 py-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder={t.pricePlaceholder}
                    className="flex-1 px-4 py-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(e.target.value)}
                    placeholder={t.quantity}
                    className="w-20 px-4 py-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 text-center"
                  />
                  <button
                    type="submit"
                    disabled={isAddingItem || !itemName || !itemPrice}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl font-medium transition-all"
                  >
                    {isAddingItem ? '...' : t.addItem}
                  </button>
                </div>
              </form>

              {/* My total */}
              {myItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t.yourTotal}</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(totals.total, currency)}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* All items from everyone */}
            <section className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up stagger-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.allItems}
              </h2>

              {items.length === 0 ? (
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  {t.noItemsInBill}
                </p>
              ) : (
                <div className="space-y-3">
                  {participants.map(participant => {
                    const pItems = items.filter(i => i.created_by_participant_id === participant.id);
                    if (pItems.length === 0) return null;

                    const pTotal = getParticipantTotal(participant.id, items, Number(room.tip_percent), Number(room.tax_percent));
                    const isMe = participant.id === currentParticipant?.id;

                    return (
                      <div key={participant.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium">
                              {participant.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {participant.name} {isMe && `(${t.you})`}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(pTotal.total, currency)}
                          </span>
                        </div>
                        <div className="pl-10 space-y-1">
                          {pItems.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {item.name} {item.quantity > 1 && `x${item.quantity}`}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400">
                                {formatCurrency(getItemTotal(item), currency)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Room total */}
              {items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{t.total}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(roomTotals.grandTotal, currency)}
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Tip & Tax - Creator only */}
            {isCreator && (
              <section className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up stagger-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t.tipAndTax}
                </h2>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t.tip} %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={tipPercent}
                      onChange={(e) => setTipPercent(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] border-0 rounded-xl text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">{t.tax} %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={taxPercent}
                      onChange={(e) => setTaxPercent(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] border-0 rounded-xl text-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleSaveTipTax}
                    disabled={isSavingTipTax}
                    className="self-end px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium"
                  >
                    {isSavingTipTax ? '...' : t.save}
                  </button>
                </div>
              </section>
            )}

            {/* Finalize button - Creator only */}
            {isCreator && items.length > 0 && (
              <button
                onClick={handleFinalize}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.finalizeBill}
              </button>
            )}
          </>
        )}

        {/* Paying phase */}
        {room.status === 'paying' && (
          <>
            <section className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t.paymentMode}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {t.yourShare}: <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totals.total, currency)}</span>
                </p>
              </div>

              {/* All items grouped by person */}
              <div className="space-y-4">
                {participants.map(participant => {
                  const pItems = items.filter(i => i.created_by_participant_id === participant.id);
                  if (pItems.length === 0) return null;

                  const pTotal = getParticipantTotal(participant.id, items, Number(room.tip_percent), Number(room.tax_percent));
                  const isMe = participant.id === currentParticipant?.id;

                  return (
                    <div key={participant.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                            {participant.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white block">
                              {participant.name} {isMe && `(${t.you})`}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatCurrency(pTotal.total, currency)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {pItems.map(item => {
                          const itemTotal = getItemTotal(item);
                          const itemPayments = payments.filter(p => p.item_id === item.id);
                          const isPaid = itemPayments.length > 0;
                          const paidBy = isPaid
                            ? participants.find(p => p.id === itemPayments[0].paid_by_participant_id)
                            : null;

                          return (
                            <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#1c1c1e] rounded-xl">
                              <div className="flex-1">
                                <span className="text-gray-900 dark:text-white">{item.name}</span>
                                {item.quantity > 1 && (
                                  <span className="text-gray-400 text-sm ml-1">x{item.quantity}</span>
                                )}
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {formatCurrency(itemTotal, currency)}
                                </div>
                              </div>

                              {isPaid ? (
                                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                                  {t.paid} {paidBy && paidBy.id !== participant.id && `(${paidBy.name})`}
                                </span>
                              ) : !isMe ? (
                                <button
                                  onClick={() => handlePayItem(item.id, itemTotal)}
                                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-medium transition-all"
                                >
                                  {t.payFor}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handlePayItem(item.id, itemTotal)}
                                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium transition-all"
                                >
                                  {t.markAsPaid}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Summary */}
            <section className="bg-white dark:bg-[#1c1c1e] rounded-3xl shadow-sm p-6 animate-fade-in-up stagger-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t.summary}
              </h2>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{t.subtotal}</span>
                  <span className="text-gray-900 dark:text-white">{formatCurrency(roomTotals.subtotal, currency)}</span>
                </div>
                {Number(room.tip_percent) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t.tip} ({room.tip_percent}%)</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(roomTotals.tipTotal, currency)}</span>
                  </div>
                )}
                {Number(room.tax_percent) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t.tax} ({room.tax_percent}%)</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(roomTotals.taxTotal, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white">{t.total}</span>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{formatCurrency(roomTotals.grandTotal, currency)}</span>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
