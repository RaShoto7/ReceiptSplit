'use client';

export function AnimatedBackground() {
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
