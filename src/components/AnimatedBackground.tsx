'use client';

interface AnimatedBackgroundProps {
  backgroundImage?: string | null;
}

export function AnimatedBackground({ backgroundImage }: AnimatedBackgroundProps) {
  if (backgroundImage) {
    return (
      <div className="animated-bg">
        {/* Custom background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
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
