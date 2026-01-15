'use client';

// Sound effects using Web Audio API (no external files needed)
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('receiptsplit-sounds', enabled ? 'true' : 'false');
    }
  }

  isEnabled(): boolean {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('receiptsplit-sounds');
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    }
    return this.enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (!this.isEnabled()) return;

    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  // Success sound (ascending notes)
  success() {
    this.playTone(523.25, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 0.1), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.15), 200); // G5
  }

  // Error sound (descending)
  error() {
    this.playTone(392, 0.15, 'square', 0.2); // G4
    setTimeout(() => this.playTone(329.63, 0.2, 'square', 0.2), 150); // E4
  }

  // Click/tap sound
  tap() {
    this.playTone(800, 0.05, 'sine', 0.15);
  }

  // Notification sound
  notification() {
    this.playTone(880, 0.1); // A5
    setTimeout(() => this.playTone(1108.73, 0.15), 100); // C#6
  }

  // Payment complete (celebratory)
  paymentComplete() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.2), i * 100);
    });
  }

  // Item added
  itemAdded() {
    this.playTone(600, 0.08);
    setTimeout(() => this.playTone(800, 0.1), 80);
  }

  // Item removed
  itemRemoved() {
    this.playTone(400, 0.1, 'triangle', 0.2);
  }

  // Join room
  userJoined() {
    this.playTone(440, 0.1); // A4
    setTimeout(() => this.playTone(554.37, 0.15), 100); // C#5
  }

  // Swipe
  swipe() {
    this.playTone(300, 0.05, 'sine', 0.1);
  }

  // Pop (for confetti, badges)
  pop() {
    this.playTone(1200, 0.05, 'sine', 0.2);
    setTimeout(() => this.playTone(800, 0.08, 'sine', 0.15), 50);
  }

  // Game win
  gameWin() {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'sine', 0.25), i * 80);
    });
  }

  // Vibrate (for mobile haptic feedback)
  vibrate(pattern: number | number[] = 50) {
    if (!this.isEnabled()) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
}

// Singleton instance
export const sounds = new SoundManager();

// React hook for sounds
import { useCallback } from 'react';

export function useSounds() {
  const play = useCallback((sound: keyof Omit<SoundManager, 'setEnabled' | 'isEnabled' | 'vibrate'>) => {
    (sounds as unknown as Record<string, () => void>)[sound]?.();
  }, []);

  const vibrate = useCallback((pattern?: number | number[]) => {
    sounds.vibrate(pattern);
  }, []);

  const toggle = useCallback((enabled: boolean) => {
    sounds.setEnabled(enabled);
  }, []);

  const isEnabled = useCallback(() => {
    return sounds.isEnabled();
  }, []);

  return { play, vibrate, toggle, isEnabled };
}
