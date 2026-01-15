'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const { language } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(iOS);

    // Listen for beforeinstallprompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Show prompt after a delay if not dismissed before
      const dismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Track installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    // Show iOS prompt after delay
    if (iOS && !localStorage.getItem('pwa-prompt-dismissed')) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isInstalled || (!showPrompt && !showIOSInstructions)) return null;

  return (
    <>
      {/* Install prompt banner */}
      {showPrompt && !showIOSInstructions && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
          <div className="max-w-lg mx-auto bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <img src="/logo.svg" alt="ReceiptSplit" className="w-10 h-10" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {language === 'fr' ? 'Installer ReceiptSplit' : 'Install ReceiptSplit'}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    {language === 'fr'
                      ? 'Accès rapide depuis votre écran d\'accueil. Fonctionne hors ligne !'
                      : 'Quick access from your home screen. Works offline!'}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleInstall}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all active:scale-[0.98]"
                    >
                      {language === 'fr' ? 'Installer' : 'Install'}
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="py-3 px-4 text-gray-400 hover:text-white transition-colors"
                    >
                      {language === 'fr' ? 'Plus tard' : 'Later'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="flex-shrink-0 p-1 text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="px-5 pb-5">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {language === 'fr' ? 'Hors ligne' : 'Offline'}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {language === 'fr' ? 'Rapide' : 'Fast'}
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {language === 'fr' ? 'Gratuit' : 'Free'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS instructions modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowIOSInstructions(false)} />

          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                  <img src="/logo.svg" alt="ReceiptSplit" className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'fr' ? 'Installer sur iPhone' : 'Install on iPhone'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {language === 'fr' ? 'Suivez ces étapes simples' : 'Follow these simple steps'}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {language === 'fr' ? 'Appuyez sur' : 'Tap the'}{' '}
                      <span className="inline-flex items-center">
                        <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                        </svg>
                      </span>{' '}
                      {language === 'fr' ? 'en bas' : 'share button'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {language === 'fr' ? 'Faites défiler et appuyez sur' : 'Scroll down and tap'}{' '}
                      <span className="font-semibold">
                        {language === 'fr' ? '"Sur l\'écran d\'accueil"' : '"Add to Home Screen"'}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {language === 'fr' ? 'Appuyez sur' : 'Tap'}{' '}
                      <span className="font-semibold text-blue-500">
                        {language === 'fr' ? '"Ajouter"' : '"Add"'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowIOSInstructions(false);
                  handleDismiss();
                }}
                className="w-full py-3 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-medium rounded-xl transition-all hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                {language === 'fr' ? 'Compris !' : 'Got it!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
