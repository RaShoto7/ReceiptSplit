'use client';

import { useState, useRef, ReactNode } from 'react';

interface SwipeToDeleteProps {
  children: ReactNode;
  onDelete: () => void;
  disabled?: boolean;
}

export function SwipeToDelete({ children, onDelete, disabled }: SwipeToDeleteProps) {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const threshold = -80; // Swipe threshold to trigger delete

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || disabled) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Only allow left swipe (negative values)
    if (diff < 0) {
      setTranslateX(Math.max(diff, -100));
    } else if (translateX < 0) {
      // If swiping right while already swiped left, allow recovery
      setTranslateX(Math.min(0, translateX + diff));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    if (translateX < threshold) {
      // Show delete button
      setTranslateX(-80);
    } else {
      // Reset position
      setTranslateX(0);
    }
  };

  const handleDelete = () => {
    // Animate out
    if (containerRef.current) {
      containerRef.current.style.height = `${containerRef.current.offsetHeight}px`;
      containerRef.current.style.transition = 'all 0.3s ease-out';
      containerRef.current.style.opacity = '0';
      containerRef.current.style.height = '0';
      containerRef.current.style.marginBottom = '0';
      containerRef.current.style.padding = '0';
    }

    setTimeout(onDelete, 300);
  };

  const resetPosition = () => {
    setTranslateX(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Delete button background */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end bg-red-500 rounded-xl"
        style={{ width: '80px' }}
      >
        <button
          onClick={handleDelete}
          className="w-full h-full flex items-center justify-center text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div
        className="relative bg-slate-50 dark:bg-slate-800/50"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onClick={translateX < 0 ? resetPosition : undefined}
      >
        {children}
      </div>
    </div>
  );
}
