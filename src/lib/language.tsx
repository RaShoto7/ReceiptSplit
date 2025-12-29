'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface Translations {
  // Home page
  appName: string;
  tagline: string;
  createNewBill: string;
  billName: string;
  billNamePlaceholder: string;
  yourName: string;
  yourNamePlaceholder: string;
  currency: string;
  createAndShare: string;
  noLoginRequired: string;

  // Room - Join
  joinBill: string;
  enterYourName: string;
  joinPlaceholder: string;
  join: string;
  joining: string;

  // Room - Header
  untitledBill: string;
  share: string;
  copied: string;
  linkCopied: string;
  status: string;
  statusActive: string;
  statusPaying: string;
  statusClosed: string;
  participants: string;

  // Room - Active phase
  myItems: string;
  addMyItem: string;
  itemNamePlaceholder: string;
  price: string;
  pricePlaceholder: string;
  quantity: string;
  addItem: string;
  adding: string;
  noItemsYet: string;
  addYourFirstItem: string;
  yourTotal: string;

  // All items view
  allItems: string;
  noItemsInBill: string;
  addedBy: string;

  // Tip & Tax
  tipAndTax: string;
  tip: string;
  tax: string;
  save: string;
  saving: string;

  // Payment phase
  finalizeBill: string;
  finalizing: string;
  readyToPay: string;
  paymentMode: string;
  yourShare: string;
  payMyItems: string;
  paying: string;
  paid: string;
  payFor: string;
  markAsPaid: string;

  // Summary
  summary: string;
  subtotal: string;
  total: string;
  youOwe: string;
  youAreOwed: string;
  settled: string;
  settlements: string;
  owes: string;
  to: string;

  // Misc
  copySummary: string;
  close: string;
  cancel: string;
  confirm: string;
  loading: string;
  error: string;
  success: string;
  you: string;
  creator: string;

  // Settings
  settings: string;
  language: string;
  french: string;
  english: string;

  // Errors
  nameRequired: string;
  itemNameRequired: string;
  validPriceRequired: string;
  alreadyJoined: string;

  // 404
  billNotFound: string;
  billNotFoundDesc: string;
  createNewBillButton: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    // Home page
    appName: 'ReceiptSplit',
    tagline: 'Partagez vos additions en temps réel',
    createNewBill: 'Nouvelle Addition',
    billName: 'Nom de l\'addition',
    billNamePlaceholder: 'Ex: Dîner chez Mario',
    yourName: 'Votre nom',
    yourNamePlaceholder: 'Ex: Jean',
    currency: 'Devise',
    createAndShare: 'Créer et Partager',
    noLoginRequired: 'Aucune inscription. Partagez le lien et chacun ajoute ses articles !',

    // Room - Join
    joinBill: 'Rejoindre l\'addition',
    enterYourName: 'Entrez votre nom pour rejoindre',
    joinPlaceholder: 'Votre pseudo...',
    join: 'Rejoindre',
    joining: 'Connexion...',

    // Room - Header
    untitledBill: 'Addition sans titre',
    share: 'Partager',
    copied: 'Copié !',
    linkCopied: 'Lien copié !',
    status: 'Statut',
    statusActive: 'En cours',
    statusPaying: 'Paiement',
    statusClosed: 'Terminé',
    participants: 'Participants',

    // Room - Active phase
    myItems: 'Mes articles',
    addMyItem: 'Ajouter un article',
    itemNamePlaceholder: 'Ex: Pizza Margherita',
    price: 'Prix',
    pricePlaceholder: '0.00',
    quantity: 'Qté',
    addItem: 'Ajouter',
    adding: 'Ajout...',
    noItemsYet: 'Aucun article',
    addYourFirstItem: 'Ajoutez votre premier article',
    yourTotal: 'Votre total',

    // All items view
    allItems: 'Toute l\'addition',
    noItemsInBill: 'Aucun article dans l\'addition',
    addedBy: 'Ajouté par',

    // Tip & Tax
    tipAndTax: 'Pourboire & Taxes',
    tip: 'Pourboire',
    tax: 'Taxes',
    save: 'Enregistrer',
    saving: 'Enregistrement...',

    // Payment phase
    finalizeBill: 'Finaliser l\'addition',
    finalizing: 'Finalisation...',
    readyToPay: 'Prêt à payer ?',
    paymentMode: 'Mode Paiement',
    yourShare: 'Votre part',
    payMyItems: 'Payer mes articles',
    paying: 'Paiement...',
    paid: 'Payé',
    payFor: 'Payer pour',
    markAsPaid: 'Marquer comme payé',

    // Summary
    summary: 'Résumé',
    subtotal: 'Sous-total',
    total: 'Total',
    youOwe: 'Vous devez',
    youAreOwed: 'On vous doit',
    settled: 'Réglé',
    settlements: 'Règlements',
    owes: 'doit',
    to: 'à',

    // Misc
    copySummary: 'Copier le résumé',
    close: 'Fermer',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    you: 'Vous',
    creator: 'Créateur',

    // Settings
    settings: 'Paramètres',
    language: 'Langue',
    french: 'Français',
    english: 'English',

    // Errors
    nameRequired: 'Le nom est requis',
    itemNameRequired: 'Le nom de l\'article est requis',
    validPriceRequired: 'Un prix valide est requis',
    alreadyJoined: 'Vous avez déjà rejoint cette addition',

    // 404
    billNotFound: 'Addition introuvable',
    billNotFoundDesc: 'Cette addition n\'existe pas ou a été supprimée.',
    createNewBillButton: 'Créer une nouvelle addition',
  },
  en: {
    // Home page
    appName: 'ReceiptSplit',
    tagline: 'Split bills in real-time with friends',
    createNewBill: 'Create a New Bill',
    billName: 'Bill Name',
    billNamePlaceholder: 'e.g., Dinner at Joe\'s',
    yourName: 'Your Name',
    yourNamePlaceholder: 'e.g., John',
    currency: 'Currency',
    createAndShare: 'Create & Share',
    noLoginRequired: 'No login needed. Share the link and everyone adds their items!',

    // Room - Join
    joinBill: 'Join the Bill',
    enterYourName: 'Enter your name to join',
    joinPlaceholder: 'Your name...',
    join: 'Join',
    joining: 'Joining...',

    // Room - Header
    untitledBill: 'Untitled Bill',
    share: 'Share',
    copied: 'Copied!',
    linkCopied: 'Link copied!',
    status: 'Status',
    statusActive: 'Active',
    statusPaying: 'Paying',
    statusClosed: 'Closed',
    participants: 'Participants',

    // Room - Active phase
    myItems: 'My Items',
    addMyItem: 'Add an item',
    itemNamePlaceholder: 'e.g., Margherita Pizza',
    price: 'Price',
    pricePlaceholder: '0.00',
    quantity: 'Qty',
    addItem: 'Add',
    adding: 'Adding...',
    noItemsYet: 'No items yet',
    addYourFirstItem: 'Add your first item',
    yourTotal: 'Your total',

    // All items view
    allItems: 'Full Bill',
    noItemsInBill: 'No items in the bill yet',
    addedBy: 'Added by',

    // Tip & Tax
    tipAndTax: 'Tip & Tax',
    tip: 'Tip',
    tax: 'Tax',
    save: 'Save',
    saving: 'Saving...',

    // Payment phase
    finalizeBill: 'Finalize Bill',
    finalizing: 'Finalizing...',
    readyToPay: 'Ready to pay?',
    paymentMode: 'Payment Mode',
    yourShare: 'Your share',
    payMyItems: 'Pay my items',
    paying: 'Paying...',
    paid: 'Paid',
    payFor: 'Pay for',
    markAsPaid: 'Mark as paid',

    // Summary
    summary: 'Summary',
    subtotal: 'Subtotal',
    total: 'Total',
    youOwe: 'You owe',
    youAreOwed: 'You are owed',
    settled: 'Settled',
    settlements: 'Settlements',
    owes: 'owes',
    to: 'to',

    // Misc
    copySummary: 'Copy Summary',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    you: 'You',
    creator: 'Creator',

    // Settings
    settings: 'Settings',
    language: 'Language',
    french: 'Français',
    english: 'English',

    // Errors
    nameRequired: 'Name is required',
    itemNameRequired: 'Item name is required',
    validPriceRequired: 'Valid price is required',
    alreadyJoined: 'You have already joined this bill',

    // 404
    billNotFound: 'Bill not found',
    billNotFoundDesc: 'This bill doesn\'t exist or has been deleted.',
    createNewBillButton: 'Create New Bill',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('receiptsplit-language') as Language;
    if (saved && (saved === 'fr' || saved === 'en')) {
      setLanguage(saved);
    }
    setMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('receiptsplit-language', lang);
  };

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
