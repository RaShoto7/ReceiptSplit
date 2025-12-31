'use client';

import { useState, useEffect } from 'react';
import { Room, Participant, Item, Payment, Photo, Currency } from '@/types';
import { useLanguage } from '@/lib/language';
import { getSession, setRoomSession } from '@/lib/session';
import { subscribeToRoom, unsubscribeFromRoom } from '@/lib/supabase';
import {
  joinRoomAction,
  addItemAction,
  removeItemAction,
  updateRoomStatusAction,
  updateTipTaxAction,
  payItemAction,
  removePaymentAction
} from '@/lib/actions';
import { formatCurrency, getItemTotal, getParticipantTotal, getRoomTotals } from '@/lib/calculations';
import { SettingsButton } from './SettingsModal';
import { NosMoments } from './NosMoments';
import { AnimatedBackground } from './AnimatedBackground';
import { generateReceiptPDF } from '@/lib/pdfGenerator';
import { BottomNav, TabId } from './BottomNav';
import { SmartInput } from './SmartInput';
import { VoiceAssistant } from './VoiceAssistant';
import { PaymentIntegration } from './PaymentIntegration';
import { PWAInstallPrompt } from './PWAInstallPrompt';

interface RoomClientProps {
  initialRoom: Room;
  initialParticipants: Participant[];
  initialItems: Item[];
  initialPayments: Payment[];
  initialPhotos: Photo[];
}

export function RoomClient({
  initialRoom,
  initialParticipants,
  initialItems,
  initialPayments,
  initialPhotos,
}: RoomClientProps) {
  const { t } = useLanguage();
  const [room, setRoom] = useState(initialRoom);
  const [participants, setParticipants] = useState(initialParticipants);
  const [items, setItems] = useState(initialItems);
  const [payments, setPayments] = useState(initialPayments);
  const [photos, setPhotos] = useState(initialPhotos);

  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Tab navigation
  const [activeTab, setActiveTab] = useState<TabId>('items');

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

      // Auto-show share modal for creator on first visit
      if (existing.is_creator) {
        const sharedKey = `receiptsplit-shared-${room.id}`;
        if (!localStorage.getItem(sharedKey)) {
          localStorage.setItem(sharedKey, 'true');
          setShowShareModal(true);
        }
      }
    }
  }, [participants, room.id]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = subscribeToRoom(room.id, async () => {
      try {
        const res = await fetch(`/api/room/${room.id}`);
        if (res.ok) {
          const data = await res.json();
          setRoom(data.room);
          setParticipants(data.participants);
          setItems(data.items);
          setPayments(data.payments);
          setPhotos(data.photos || []);
        }
      } catch (err) {
        console.error('Failed to refresh room data:', err);
      }
    });

    return () => {
      unsubscribeFromRoom(channel);
    };
  }, [room.id]);

  // Switch to pay tab when room status changes
  useEffect(() => {
    if (room.status === 'paying') {
      setActiveTab('pay');
    }
  }, [room.status]);

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

    window.location.reload();
  };

  // Add items from voice assistant
  const handleVoiceItems = async (voiceItems: { name: string; price: number; quantity: number }[]) => {
    if (!currentParticipant) return;

    for (const item of voiceItems) {
      const formData = new FormData();
      formData.set('roomId', room.id);
      formData.set('name', item.name);
      formData.set('price', String(item.price));
      formData.set('quantity', String(item.quantity));
      formData.set('participantId', currentParticipant.id);

      await addItemAction(formData);
    }

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

  // Finalize bill
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

  // Cancel payment
  const handleCancelPayment = async (paymentId: string) => {
    const formData = new FormData();
    formData.set('paymentId', paymentId);
    formData.set('roomId', room.id);
    await removePaymentAction(formData);
    window.location.reload();
  };

  // Share link
  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: room.title || t.untitledBill,
      text: `${t.joinBill}: ${room.title || t.untitledBill}`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or error
      }
    }

    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy link only
  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setShowShareModal(false);
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

  // Calculate remaining to pay
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingToPay = roomTotals.grandTotal - totalPaid;

  // Calculate debts
  const calculateDebts = () => {
    const debts: { from: Participant; to: Participant; amount: number }[] = [];

    participants.forEach(payer => {
      const paymentsForOthers = payments.filter(p => {
        if (p.paid_by_participant_id !== payer.id) return false;
        const item = items.find(i => i.id === p.item_id);
        return item && item.created_by_participant_id !== payer.id;
      });

      paymentsForOthers.forEach(payment => {
        const item = items.find(i => i.id === payment.item_id);
        if (!item) return;

        const owner = participants.find(p => p.id === item.created_by_participant_id);
        if (!owner) return;

        const itemTotal = getItemTotal(item);
        const proportion = itemTotal / roomTotals.subtotal;
        const tipTaxShare = (roomTotals.tipTotal + roomTotals.taxTotal) * proportion;
        const totalWithTipTax = itemTotal + tipTaxShare;

        const existingDebt = debts.find(d => d.from.id === owner.id && d.to.id === payer.id);
        if (existingDebt) {
          existingDebt.amount += totalWithTipTax;
        } else {
          debts.push({ from: owner, to: payer, amount: totalWithTipTax });
        }
      });
    });

    return debts.filter(d => d.amount > 0.01);
  };

  const debts = calculateDebts();

  // Refresh room data
  const refreshRoom = async () => {
    try {
      const res = await fetch(`/api/room/${room.id}`);
      if (res.ok) {
        const data = await res.json();
        setRoom(data.room);
        setParticipants(data.participants);
        setItems(data.items);
        setPayments(data.payments);
        setPhotos(data.photos || []);
      }
    } catch (err) {
      console.error('Failed to refresh room data:', err);
    }
  };

  // If not joined, show join form
  if (!currentParticipant) {
    return (
      <main className="min-h-screen relative">
        <AnimatedBackground backgroundImage={room.background_image} />
        <SettingsButton />
        <PWAInstallPrompt />

        <div className="max-w-md mx-auto px-4 pt-20 pb-8">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="w-24 h-24 mx-auto mb-6 logo-glow animate-bounce-in">
              <img
                src="/logo.svg"
                alt="ReceiptSplit"
                className="w-24 h-24 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {room.title || t.untitledBill}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {participants.length} {t.participants}
            </p>
          </div>

          <div className="glass-card rounded-3xl shadow-xl p-6 animate-fade-in-up stagger-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t.joinBill}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              {t.enterYourName}
            </p>

            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                value={joinName}
                onChange={(e) => setJoinName(e.target.value)}
                placeholder={t.joinPlaceholder}
                required
                className="w-full"
              />
              <button
                type="submit"
                disabled={isJoining}
                className="w-full btn-primary disabled:opacity-50 py-4 px-6 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2"
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
    <main className="min-h-screen pb-24 relative">
      <AnimatedBackground backgroundImage={room.background_image} />
      <SettingsButton
        roomId={room.id}
        isCreator={isCreator}
        hasBackground={!!room.background_image}
        onBackgroundChange={refreshRoom}
      />
      <PWAInstallPrompt />

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative glass-card rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t.share} {room.title || t.untitledBill}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {t.shareDescription}
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-3 mb-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 break-all font-mono">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopyLink}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-3 rounded-xl font-medium transition-all"
              >
                {copied ? t.copied : t.copyLink}
              </button>
              <button
                onClick={() => {
                  handleShare();
                  setShowShareModal(false);
                }}
                className="flex-1 btn-primary py-3 rounded-xl font-medium"
              >
                {t.share}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="glass-card pt-12 pb-4 px-4 rounded-b-3xl shadow-lg">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="ReceiptSplit" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                  {room.title || t.untitledBill}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {participants.length} {t.participants}
                </p>
              </div>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-medium transition-all active:scale-95 border border-blue-200 dark:border-blue-800"
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

          {/* Status and user info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              room.status === 'active'
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : room.status === 'paying'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
            }`}>
              {room.status === 'active' ? t.statusActive : room.status === 'paying' ? t.statusPaying : t.statusClosed}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {t.you}: {currentParticipant.name} {isCreator && `(${t.creator})`}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Active phase - Add items */}
        {room.status === 'active' && (
          <>
            {/* My Items Tab */}
            {activeTab === 'items' && (
              <section className="premium-card rounded-3xl shadow-lg p-6 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t.myItems}
                  </h2>
                  {/* Voice Assistant Button */}
                  <VoiceAssistant
                    onItemsDetected={handleVoiceItems}
                    currency={currency}
                  />
                </div>

                {myItems.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">
                    {t.addYourFirstItem}
                  </p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {myItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                          {item.quantity > 1 && (
                            <span className="text-slate-400 dark:text-slate-500 text-sm ml-2">x{item.quantity}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(getItemTotal(item), currency)}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500 hover:text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

                {/* Add item form with smart input */}
                <form onSubmit={handleAddItem} className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide font-medium">
                      {t.itemNamePlaceholder.split(':')[0] || 'Produit'}
                    </label>
                    <SmartInput
                      value={itemName}
                      onChange={setItemName}
                      placeholder={t.itemNamePlaceholder}
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="w-20">
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide font-medium">
                        {t.quantity}
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={itemQuantity}
                        onChange={(e) => setItemQuantity(e.target.value)}
                        placeholder="1"
                        className="text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide font-medium">
                        {t.price} ({currency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={itemPrice}
                        onChange={(e) => setItemPrice(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAddingItem || !itemName || !itemPrice}
                      className="self-end px-6 py-3.5 btn-primary disabled:opacity-40 disabled:shadow-none rounded-xl font-medium"
                    >
                      {isAddingItem ? '...' : '+'}
                    </button>
                  </div>
                </form>

                {/* My total */}
                {myItems.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">{t.yourTotal}</span>
                      <span className="text-xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(totals.total, currency)}
                      </span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Full Bill Tab */}
            {activeTab === 'bill' && (
              <section className="premium-card rounded-3xl shadow-lg p-6 animate-fade-in-up">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {t.allItems}
                </h2>

                {items.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 text-sm">
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
                        <div key={participant.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                isMe ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                              }`}>
                                {participant.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-900 dark:text-white">
                                {participant.name} {isMe && `(${t.you})`}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(pTotal.total, currency)}
                            </span>
                          </div>
                          <div className="pl-10 space-y-1">
                            {pItems.map(item => (
                              <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">
                                  {item.name} {item.quantity > 1 && `x${item.quantity}`}
                                </span>
                                <span className="text-slate-600 dark:text-slate-400">
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
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">{t.total}</span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(roomTotals.grandTotal, currency)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tip & Tax - Creator only */}
                {isCreator && (
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      {t.tipAndTax}
                    </h3>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t.tip} %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={tipPercent}
                          onChange={(e) => setTipPercent(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">{t.tax} %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={taxPercent}
                          onChange={(e) => setTaxPercent(e.target.value)}
                        />
                      </div>
                      <button
                        onClick={handleSaveTipTax}
                        disabled={isSavingTipTax}
                        className="self-end px-4 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium"
                      >
                        {isSavingTipTax ? '...' : t.save}
                      </button>
                    </div>
                  </div>
                )}

                {/* Finalize button - Creator only */}
                {isCreator && items.length > 0 && (
                  <button
                    onClick={handleFinalize}
                    className="w-full mt-6 btn-premium py-4 px-6 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t.finalizeBill}
                  </button>
                )}
              </section>
            )}

            {/* Moments Tab */}
            {activeTab === 'moments' && (
              <NosMoments
                roomId={room.id}
                photos={photos}
                participants={participants}
                currentParticipantId={currentParticipant?.id || null}
              />
            )}
          </>
        )}

        {/* Paying phase */}
        {room.status === 'paying' && (
          <>
            {/* Pay Tab - Main payment view */}
            {activeTab === 'pay' && (
              <>
                {/* Remaining to pay banner */}
                <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl shadow-lg p-6 text-white animate-fade-in-up">
                  <div className="text-center">
                    <p className="text-white/80 text-sm mb-1">{t.remainingToPay}</p>
                    <p className="text-4xl font-bold">
                      {remainingToPay > 0 ? formatCurrency(remainingToPay, currency) : t.allPaid}
                    </p>
                    <p className="text-white/80 text-sm mt-2">
                      {t.total}: {formatCurrency(roomTotals.grandTotal, currency)}
                    </p>
                  </div>
                </section>

                {/* Items by person */}
                <section className="premium-card rounded-3xl shadow-lg p-6 animate-fade-in-up stagger-1">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                    {t.paymentMode}
                  </h2>

                  <div className="space-y-4">
                    {participants.map(participant => {
                      const pItems = items.filter(i => i.created_by_participant_id === participant.id);
                      if (pItems.length === 0) return null;

                      const pTotal = getParticipantTotal(participant.id, items, Number(room.tip_percent), Number(room.tax_percent));
                      const isMe = participant.id === currentParticipant?.id;

                      return (
                        <div key={participant.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                                isMe ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-slate-400 to-slate-500'
                              }`}>
                                {participant.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-medium text-slate-900 dark:text-white block">
                                  {participant.name} {isMe && `(${t.you})`}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  {formatCurrency(pTotal.total, currency)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {pItems.map(item => {
                              const itemTotal = getItemTotal(item);
                              const itemPayment = payments.find(p => p.item_id === item.id);
                              const isPaid = !!itemPayment;
                              const paidBy = isPaid
                                ? participants.find(p => p.id === itemPayment.paid_by_participant_id)
                                : null;
                              const canCancel = isPaid && itemPayment.paid_by_participant_id === currentParticipant?.id;

                              return (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900/50 rounded-xl">
                                  <div className="flex-1">
                                    <span className="text-slate-900 dark:text-white">{item.name}</span>
                                    {item.quantity > 1 && (
                                      <span className="text-slate-400 text-sm ml-1">x{item.quantity}</span>
                                    )}
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                      {formatCurrency(itemTotal, currency)}
                                    </div>
                                  </div>

                                  {isPaid ? (
                                    <div className="flex items-center gap-2">
                                      <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium">
                                        {t.paid} {paidBy && paidBy.id !== participant.id && `(${paidBy.name})`}
                                      </span>
                                      {canCancel && (
                                        <button
                                          onClick={() => handleCancelPayment(itemPayment.id)}
                                          className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-xs font-medium transition-all"
                                        >
                                          {t.cancelPayment}
                                        </button>
                                      )}
                                    </div>
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
                                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium transition-all"
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

                {/* Who owes what */}
                {debts.length > 0 && (
                  <section className="premium-card rounded-3xl shadow-lg p-6 animate-fade-in-up stagger-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                      {t.whoOwesWhat}
                    </h2>

                    <div className="space-y-3">
                      {debts.map((debt, i) => {
                        const isFromMe = debt.from.id === currentParticipant?.id;
                        const isToMe = debt.to.id === currentParticipant?.id;

                        return (
                          <div
                            key={i}
                            className={`p-4 rounded-2xl ${
                              isFromMe
                                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                                : isToMe
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-slate-50 dark:bg-slate-800/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium ${isFromMe ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                                  {isFromMe ? t.you : debt.from.name}
                                </span>
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                                <span className={`font-medium ${isToMe ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                  {isToMe ? t.you : debt.to.name}
                                </span>
                              </div>
                              <span className={`font-bold text-lg ${
                                isFromMe
                                  ? 'text-red-600 dark:text-red-400'
                                  : isToMe
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}>
                                {formatCurrency(debt.amount, currency)}
                              </span>
                            </div>

                            {/* Payment integration for debts */}
                            {isFromMe && debt.amount > 0 && (
                              <div className="mt-3">
                                <PaymentIntegration
                                  amount={debt.amount}
                                  currency={currency}
                                  recipientName={debt.to.name}
                                  description={`${room.title || 'ReceiptSplit'} - ${t.youOwe}`}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Bill Tab in paying mode - Summary */}
            {activeTab === 'bill' && (
              <section className="premium-card rounded-3xl shadow-lg p-6 animate-fade-in-up">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {t.summary}
                </h2>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{t.subtotal}</span>
                    <span className="text-slate-900 dark:text-white">{formatCurrency(roomTotals.subtotal, currency)}</span>
                  </div>
                  {Number(room.tip_percent) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t.tip} ({room.tip_percent}%)</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency(roomTotals.tipTotal, currency)}</span>
                    </div>
                  )}
                  {Number(room.tax_percent) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t.tax} ({room.tax_percent}%)</span>
                      <span className="text-slate-900 dark:text-white">{formatCurrency(roomTotals.taxTotal, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="font-semibold text-slate-900 dark:text-white">{t.total}</span>
                    <span className="font-bold text-xl text-slate-900 dark:text-white">{formatCurrency(roomTotals.grandTotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>{t.paid}</span>
                    <span>-{formatCurrency(totalPaid, currency)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                    <span className="font-semibold text-amber-600 dark:text-amber-400">{t.remainingToPay}</span>
                    <span className="font-bold text-xl text-amber-600 dark:text-amber-400">
                      {formatCurrency(Math.max(0, remainingToPay), currency)}
                    </span>
                  </div>
                </div>

                {/* Download PDF button */}
                <button
                  onClick={() => generateReceiptPDF({
                    room,
                    participants,
                    items,
                    payments,
                    language: (localStorage.getItem('receiptsplit-language') as 'fr' | 'en') || 'fr',
                  })}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.downloadPdf}
                </button>
              </section>
            )}

            {/* Moments Tab in paying mode */}
            {activeTab === 'moments' && (
              <NosMoments
                roomId={room.id}
                photos={photos}
                participants={participants}
                currentParticipantId={currentParticipant?.id || null}
              />
            )}

            {/* Items tab in paying mode */}
            {activeTab === 'items' && (
              <section className="premium-card rounded-3xl shadow-lg p-6 animate-fade-in-up">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {t.myItems}
                </h2>
                {myItems.length === 0 ? (
                  <p className="text-slate-400">{t.noItemsYet}</p>
                ) : (
                  <div className="space-y-2">
                    {myItems.map(item => {
                      const itemPayment = payments.find(p => p.item_id === item.id);
                      const isPaid = !!itemPayment;

                      return (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
                            {item.quantity > 1 && (
                              <span className="text-slate-400 text-sm ml-2">x{item.quantity}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(getItemTotal(item), currency)}
                            </span>
                            {isPaid && (
                              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs">
                                {t.paid}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">{t.yourTotal}</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                      {formatCurrency(totals.total, currency)}
                    </span>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showPayTab={room.status === 'paying'}
        photosCount={photos.length}
        itemsCount={myItems.length}
      />
    </main>
  );
}
