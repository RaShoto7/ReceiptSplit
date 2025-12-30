'use client';

import { useState, useEffect } from 'react';

export function AnimatedBackground() {
  const [customBg, setCustomBg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('receiptsplit-custom-bg');
    if (saved) {
      setCustomBg(saved);
    }

    // Listen for custom background changes
    const handleStorageChange = () => {
      const newBg = localStorage.getItem('receiptsplit-custom-bg');
      setCustomBg(newBg);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('customBgChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customBgChange', handleStorageChange);
    };
  }, []);

  if (customBg) {
    return (
      <div className="animated-bg">
        {/* Custom background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${customBg})` }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/70 dark:from-gray-900/80 dark:via-gray-900/60 dark:to-gray-900/80" />
      </div>
    );
  }

  return (
    <div className="animated-bg">
      {/* Floating gradient orbs */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />
      <div className="floating-orb orb-4" />

      {/* Floating icons */}
      <div className="floating-icons">
        <span className="float-icon float-icon-1">🧾</span>
        <span className="float-icon float-icon-2">💰</span>
        <span className="float-icon float-icon-3">🍽️</span>
        <span className="float-icon float-icon-4">✨</span>
        <span className="float-icon float-icon-5">🎉</span>
      </div>
    </div>
  );
}

// Helper function to trigger background update
export function updateCustomBackground(imageData: string | null) {
  if (imageData) {
    localStorage.setItem('receiptsplit-custom-bg', imageData);
  } else {
    localStorage.removeItem('receiptsplit-custom-bg');
  }
  window.dispatchEvent(new Event('customBgChange'));
}
