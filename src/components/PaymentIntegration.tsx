'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/language';
import { formatCurrency } from '@/lib/calculations';
import { Currency } from '@/types';

interface PaymentIntegrationProps {
  amount: number;
  currency: Currency;
  recipientName: string;
  recipientEmail?: string;
  description?: string;
  onPaymentInitiated?: () => void;
}

type PaymentMethod = 'wero' | 'paypal' | 'venmo' | 'revolut' | 'lydia' | 'paylib';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  color: string;
  available: boolean;
  getUrl: (amount: number, currency: string, email?: string, note?: string) => string;
}

export function PaymentIntegration({
  amount,
  currency,
  recipientName,
  recipientEmail,
  description,
  onPaymentInitiated,
}: PaymentIntegrationProps) {
  const { language } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentEmail, setPaymentEmail] = useState(recipientEmail || '');
  const [paymentPhone, setPaymentPhone] = useState('');

  const paymentOptions: PaymentOption[] = [
    {
      id: 'wero',
      name: 'Wero',
      icon: '🟢',
      color: 'from-green-500 to-emerald-600',
      available: true,
      getUrl: (amt, _cur, phone, note) => {
        const encodedNote = encodeURIComponent(note || `ReceiptSplit - ${recipientName}`);
        // Wero uses IBAN or phone for European instant payments
        // The app will open and user can select contact
        if (phone) {
          return `wero://send?amount=${amt}&phone=${encodeURIComponent(phone)}&message=${encodedNote}`;
        }
        return `wero://send?amount=${amt}&message=${encodedNote}`;
      },
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '💳',
      color: 'from-blue-500 to-blue-600',
      available: true,
      getUrl: (amt, cur, email, note) => {
        const encodedNote = encodeURIComponent(note || `ReceiptSplit - ${recipientName}`);
        // PayPal.me link or direct payment
        if (email) {
          return `https://www.paypal.com/paypalme/${email}/${amt}${cur}?note=${encodedNote}`;
        }
        return `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&amount=${amt}&currency_code=${cur}&item_name=${encodedNote}`;
      },
    },
    {
      id: 'venmo',
      name: 'Venmo',
      icon: '📱',
      color: 'from-sky-400 to-blue-500',
      available: true,
      getUrl: (amt, _cur, _email, note) => {
        const encodedNote = encodeURIComponent(note || `ReceiptSplit - ${recipientName}`);
        // Venmo deep link
        return `venmo://paycharge?txn=pay&amount=${amt}&note=${encodedNote}`;
      },
    },
    {
      id: 'revolut',
      name: 'Revolut',
      icon: '🔄',
      color: 'from-violet-500 to-purple-600',
      available: true,
      getUrl: (amt, _cur, _email, note) => {
        const encodedNote = encodeURIComponent(note || `ReceiptSplit`);
        return `https://revolut.me/pay?amount=${amt}&note=${encodedNote}`;
      },
    },
    {
      id: 'lydia',
      name: 'Lydia',
      icon: '💜',
      color: 'from-pink-500 to-rose-500',
      available: true,
      getUrl: (amt, _cur, phone, note) => {
        const encodedNote = encodeURIComponent(note || `ReceiptSplit`);
        // Lydia deep link
        if (phone) {
          return `lydia://request?amount=${amt}&phone=${phone}&message=${encodedNote}`;
        }
        return `lydia://request?amount=${amt}&message=${encodedNote}`;
      },
    },
    {
      id: 'paylib',
      name: 'Paylib',
      icon: '🏦',
      color: 'from-emerald-500 to-teal-600',
      available: true,
      getUrl: (amt, _cur, phone, note) => {
        const encodedNote = encodeURIComponent(note || `ReceiptSplit`);
        return `paylib://send?amount=${amt}&phone=${phone || ''}&message=${encodedNote}`;
      },
    },
  ];

  const handlePaymentSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  const initiatePayment = () => {
    if (!selectedMethod) return;

    const option = paymentOptions.find(o => o.id === selectedMethod);
    if (!option) return;

    const note = description || `${language === 'fr' ? 'Paiement via' : 'Payment via'} ReceiptSplit`;
    const identifier = selectedMethod === 'wero' || selectedMethod === 'lydia' || selectedMethod === 'paylib' ? paymentPhone : paymentEmail;

    const url = option.getUrl(amount, currency, identifier, note);

    // Track payment initiation
    onPaymentInitiated?.();

    // Open payment link
    window.open(url, '_blank', 'noopener,noreferrer');

    // Close modal
    setShowModal(false);
    setSelectedMethod(null);
  };

  const copyPaymentDetails = () => {
    const details = `${language === 'fr' ? 'Montant' : 'Amount'}: ${formatCurrency(amount, currency)}
${language === 'fr' ? 'Pour' : 'To'}: ${recipientName}
${description ? `${language === 'fr' ? 'Note' : 'Note'}: ${description}` : ''}`;

    navigator.clipboard.writeText(details);
  };

  return (
    <>
      {/* Pay Now Button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        {language === 'fr' ? 'Payer maintenant' : 'Pay Now'}
        <span className="px-2 py-0.5 bg-white/20 rounded-lg text-sm">
          {formatCurrency(amount, currency)}
        </span>
      </button>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => {
              setShowModal(false);
              setSelectedMethod(null);
            }}
          />

          <div className="relative w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedMethod(null);
                }}
                className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {language === 'fr' ? 'Envoyer de l\'argent' : 'Send Money'}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {language === 'fr' ? 'À' : 'To'} {recipientName}
                  </p>
                </div>
              </div>

              <div className="text-center py-4">
                <p className="text-white/80 text-sm">
                  {language === 'fr' ? 'Montant' : 'Amount'}
                </p>
                <p className="text-4xl font-bold">
                  {formatCurrency(amount, currency)}
                </p>
              </div>
            </div>

            <div className="p-6">
              {!selectedMethod ? (
                <>
                  {/* Payment options */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {language === 'fr' ? 'Choisissez votre méthode de paiement' : 'Choose your payment method'}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {paymentOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handlePaymentSelect(option.id)}
                        disabled={!option.available}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-gray-100 dark:border-slate-700 hover:border-transparent hover:bg-gradient-to-br hover:${option.color} hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group`}
                      >
                        <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                          {option.icon}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white group-hover:text-white">
                          {option.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Copy details */}
                  <button
                    onClick={copyPaymentDetails}
                    className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {language === 'fr' ? 'Copier les détails' : 'Copy details'}
                  </button>
                </>
              ) : (
                <>
                  {/* Selected method form */}
                  <button
                    onClick={() => setSelectedMethod(null)}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-4 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {language === 'fr' ? 'Retour' : 'Back'}
                  </button>

                  <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-3xl">
                      {paymentOptions.find(o => o.id === selectedMethod)?.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {paymentOptions.find(o => o.id === selectedMethod)?.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'fr' ? 'Paiement sécurisé' : 'Secure payment'}
                      </p>
                    </div>
                  </div>

                  {/* Input for identifier */}
                  {(selectedMethod === 'wero' || selectedMethod === 'lydia' || selectedMethod === 'paylib') ? (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'fr' ? 'Numéro de téléphone du destinataire' : 'Recipient phone number'}
                      </label>
                      <input
                        type="tel"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder={language === 'fr' ? 'Ex: 06 12 34 56 78' : 'Ex: +33 6 12 34 56 78'}
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 border-0 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {language === 'fr' ? 'Email ou identifiant du destinataire' : 'Recipient email or username'}
                      </label>
                      <input
                        type="text"
                        value={paymentEmail}
                        onChange={(e) => setPaymentEmail(e.target.value)}
                        placeholder={language === 'fr' ? 'Email ou @username' : 'Email or @username'}
                        className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-800 border-0 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        {language === 'fr' ? 'Optionnel - vous pouvez aussi chercher le contact dans l\'app' : 'Optional - you can also find the contact in the app'}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={initiatePayment}
                    className={`w-full py-4 rounded-2xl font-semibold text-white shadow-lg transition-all active:scale-[0.98] bg-gradient-to-r ${paymentOptions.find(o => o.id === selectedMethod)?.color}`}
                  >
                    {language === 'fr' ? 'Ouvrir' : 'Open'} {paymentOptions.find(o => o.id === selectedMethod)?.name}
                  </button>
                </>
              )}
            </div>

            {/* Safe area */}
            <div className="h-safe bg-white dark:bg-slate-900" />
          </div>
        </div>
      )}
    </>
  );
}
