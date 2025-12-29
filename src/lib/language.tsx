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
  currency: string;
  createBill: string;
  noLoginRequired: string;

  // Room
  untitledBill: string;
  share: string;
  copied: string;

  // Participants
  people: string;
  addPeoplePlaceholder: string;
  addPersonPlaceholder: string;
  add: string;
  payer: string;
  setPayer: string;
  removePayer: string;
  alreadyInGroup: string;

  // Items
  items: string;
  addPeopleFirst: string;
  addItemsToSplit: string;
  itemName: string;
  itemNamePlaceholder: string;
  price: string;
  quantity: string;
  categoryOptional: string;
  addItem: string;
  notAssigned: string;
  splitByAll: string;
  splitBy: string;
  selectAll: string;
  clear: string;

  // Tip & Tax
  tipAndTax: string;
  tip: string;
  tax: string;
  noTip: string;
  noTax: string;
  percentage: string;
  fixedAmount: string;
  update: string;
  updating: string;

  // Summary
  summary: string;
  addPeopleAndItems: string;
  subtotal: string;
  whoPaysWho: string;
  whoOwesWho: string;
  copySummary: string;
  billSplit: string;
  breakdown: string;
  settlements: string;
  total: string;
  splitWith: string;
  untitled: string;

  // Settings
  settings: string;
  language: string;
  french: string;
  english: string;

  // Errors
  nameRequired: string;
  itemNameRequired: string;
  validAmountRequired: string;

  // 404
  billNotFound: string;
  createNewBillButton: string;
}

const translations: Record<Language, Translations> = {
  fr: {
    appName: 'ReceiptSplit',
    tagline: 'Partagez vos additions facilement',
    createNewBill: 'Nouvelle Addition',
    billName: 'Nom de l\'addition',
    billNamePlaceholder: 'Ex: Dîner chez Mario',
    currency: 'Devise',
    createBill: 'Créer l\'addition',
    noLoginRequired: 'Aucune inscription requise. Partagez le lien !',

    untitledBill: 'Addition sans titre',
    share: 'Partager',
    copied: 'Copié !',

    people: 'Participants',
    addPeoplePlaceholder: 'Ajouter des participants pour partager',
    addPersonPlaceholder: 'Nom du participant...',
    add: 'Ajouter',
    payer: 'Payeur',
    setPayer: 'Définir payeur',
    removePayer: 'Retirer payeur',
    alreadyInGroup: 'est déjà dans le groupe',

    items: 'Articles',
    addPeopleFirst: 'Ajoutez d\'abord des participants',
    addItemsToSplit: 'Ajoutez des articles à partager',
    itemName: 'Article',
    itemNamePlaceholder: 'Nom de l\'article...',
    price: 'Prix',
    quantity: 'Qté',
    categoryOptional: 'Catégorie (optionnel)',
    addItem: 'Ajouter',
    notAssigned: 'Non assigné',
    splitByAll: 'Partagé par tous',
    splitBy: 'Partagé par',
    selectAll: 'Tout sélectionner',
    clear: 'Effacer',

    tipAndTax: 'Pourboire & Taxes',
    tip: 'Pourboire',
    tax: 'Taxe',
    noTip: 'Pas de pourboire',
    noTax: 'Pas de taxe',
    percentage: 'Pourcentage',
    fixedAmount: 'Montant fixe',
    update: 'Mettre à jour',
    updating: 'Mise à jour...',

    summary: 'Résumé',
    addPeopleAndItems: 'Ajoutez des participants et articles pour voir le partage',
    subtotal: 'Sous-total',
    whoPaysWho: 'Qui paie qui',
    whoOwesWho: 'Qui doit combien',
    copySummary: 'Copier le résumé',
    billSplit: 'Partage d\'addition',
    breakdown: 'Détail',
    settlements: 'Règlements',
    total: 'Total',
    splitWith: 'Partagé avec ReceiptSplit',
    untitled: 'Sans titre',

    settings: 'Paramètres',
    language: 'Langue',
    french: 'Français',
    english: 'English',

    nameRequired: 'Le nom est requis',
    itemNameRequired: 'Le nom de l\'article est requis',
    validAmountRequired: 'Un montant valide est requis',

    billNotFound: 'Cette addition n\'existe pas ou a été supprimée.',
    createNewBillButton: 'Créer une nouvelle addition',
  },
  en: {
    appName: 'ReceiptSplit',
    tagline: 'Split bills easily with friends',
    createNewBill: 'Create a New Bill',
    billName: 'Bill Name',
    billNamePlaceholder: 'e.g., Dinner at Joe\'s',
    currency: 'Currency',
    createBill: 'Create Bill',
    noLoginRequired: 'No login required. Share the link to split!',

    untitledBill: 'Untitled Bill',
    share: 'Share',
    copied: 'Copied!',

    people: 'People',
    addPeoplePlaceholder: 'Add people to split the bill with',
    addPersonPlaceholder: 'Add person...',
    add: 'Add',
    payer: 'Payer',
    setPayer: 'Set payer',
    removePayer: 'Remove payer',
    alreadyInGroup: 'is already in the group',

    items: 'Items',
    addPeopleFirst: 'Add people first before adding items',
    addItemsToSplit: 'Add items to split',
    itemName: 'Item',
    itemNamePlaceholder: 'Item name...',
    price: 'Price',
    quantity: 'Qty',
    categoryOptional: 'Category (optional)',
    addItem: 'Add Item',
    notAssigned: 'Not assigned',
    splitByAll: 'Split by all',
    splitBy: 'Split by',
    selectAll: 'Select all',
    clear: 'Clear',

    tipAndTax: 'Tip & Tax',
    tip: 'Tip',
    tax: 'Tax',
    noTip: 'No tip',
    noTax: 'No tax',
    percentage: 'Percentage',
    fixedAmount: 'Fixed amount',
    update: 'Update',
    updating: 'Updating...',

    summary: 'Summary',
    addPeopleAndItems: 'Add people and items to see the split',
    subtotal: 'Subtotal',
    whoPaysWho: 'Who pays who',
    whoOwesWho: 'Who owes who',
    copySummary: 'Copy Summary',
    billSplit: 'Bill Split',
    breakdown: 'Breakdown',
    settlements: 'Settlements',
    total: 'Total',
    splitWith: 'Split with ReceiptSplit',
    untitled: 'Untitled',

    settings: 'Settings',
    language: 'Language',
    french: 'Français',
    english: 'English',

    nameRequired: 'Name is required',
    itemNameRequired: 'Item name is required',
    validAmountRequired: 'Valid amount is required',

    billNotFound: 'This bill doesn\'t exist or has been deleted.',
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
