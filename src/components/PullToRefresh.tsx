'use client';

import { useState, useRef, ReactNode, useCallback } from 'react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
}

export function PullToRefresh({ children, onRefresh, disabled }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = 80;
  const maxPull = 120;

  const canPull = useCallback(() => {
    if (disabled || isRefreshing) return false;
    // Only allow pull when at top of page
    return window.scrollY <= 0;
  }, [disabled, isRefreshing]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canPull()) return;
    startY.current = e.touches[0].clientY;
    setIsPulling(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || !canPull()) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      // Apply resistance
      const resistance = 0.5;
      const newDistance = Math.min(diff * resistance, maxPull);
      setPullDistance(newDistance);

      // Prevent default scroll when pulling
      if (newDistance > 10) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(60); // Keep spinner visible

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <div
        className="absolute left-0 right-0 flex items-center justify-center overflow-hidden transition-all"
        style={{
          height: `${pullDistance}px`,
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          className={`w-8 h-8 rounded-full border-2 border-blue-500 flex items-center justify-center transition-all ${
            isRefreshing ? 'animate-spin' : ''
          }`}
          style={{
            transform: `rotate(${progress * 360}deg) scale(${0.5 + progress * 0.5})`,
            opacity: progress,
            borderTopColor: 'transparent',
          }}
        >
          {!isRefreshing && progress >= 1 && (
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  );
}
