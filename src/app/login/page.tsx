'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { AnimatedBackground } from '@/components/AnimatedBackground';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the redirect path from query params
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectPath(redirect);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      // Redirect to the original page they were trying to access
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
              src="/logo.png"
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
            Entrez le mot de passe pour accéder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="premium-card rounded-3xl shadow-lg p-6 animate-fade-in-up stagger-2">
          <div className="mb-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe..."
              className="w-full px-4 py-3 bg-[#f2f2f7] dark:bg-[#2c2c2e] border-0 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center animate-fade-in">
              Mot de passe incorrect
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full btn-premium disabled:opacity-50 py-4 px-6 rounded-2xl text-lg font-semibold"
          >
            {isLoading ? 'Vérification...' : 'Accéder'}
          </button>
        </form>
      </div>
    </main>
  );
}
