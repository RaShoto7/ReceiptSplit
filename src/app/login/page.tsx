'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { signIn } from 'next-auth/react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { useLanguage } from '@/lib/language';

export default function LoginPage() {
  const { t, language } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get('redirect') || searchParams.get('callbackUrl');
    if (redirect) {
      setRedirectPath(redirect);
    }
  }, [searchParams]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: redirectPath });
  };

  const handleAppleSignIn = () => {
    signIn('apple', { callbackUrl: redirectPath });
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push(redirectPath);
      router.refresh();
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />

      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-4 logo-glow animate-bounce-in">
            <Image
              src="/logo.svg"
              alt="ReceiptSplit"
              width={96}
              height={96}
              className="w-24 h-24 object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ReceiptSplit
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {language === 'fr' ? 'Connectez-vous pour accéder à votre historique' : 'Sign in to access your history'}
          </p>
        </div>

        <div className="premium-card rounded-3xl shadow-lg p-6 animate-fade-in-up stagger-2">
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {language === 'fr' ? 'Continuer avec Google' : 'Continue with Google'}
            </button>

            <button
              onClick={handleAppleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-medium hover:bg-gray-900 dark:hover:bg-gray-100 transition-all active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {language === 'fr' ? 'Continuer avec Apple' : 'Continue with Apple'}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
            <span className="text-sm text-gray-400 dark:text-slate-500">
              {language === 'fr' ? 'ou' : 'or'}
            </span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700"></div>
          </div>

          {/* Skip / Continue without account */}
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            {language === 'fr' ? 'Continuer sans compte' : 'Continue without account'}
          </button>

          {/* Admin Password Section (collapsible) */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 transition-colors"
            >
              <svg className={`w-4 h-4 transition-transform ${showPassword ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {language === 'fr' ? 'Accès admin' : 'Admin access'}
            </button>

            {showPassword && (
              <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3 animate-fade-in">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={language === 'fr' ? 'Mot de passe admin...' : 'Admin password...'}
                  className="w-full px-4 py-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] border-0 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500"
                />
                {error && (
                  <p className="text-red-500 text-sm text-center animate-fade-in">
                    {language === 'fr' ? 'Mot de passe incorrect' : 'Incorrect password'}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isLoading || !password}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 disabled:opacity-50 py-3 px-6 rounded-xl font-medium"
                >
                  {isLoading ? '...' : (language === 'fr' ? 'Accéder' : 'Access')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Info text */}
        <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-6">
          {language === 'fr'
            ? 'En vous connectant, vous pourrez retrouver vos additions passées'
            : 'By signing in, you can access your past bills'}
        </p>
      </div>
    </main>
  );
}
