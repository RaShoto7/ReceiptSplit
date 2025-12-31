'use client';

class NotificationManager {
  private permission: NotificationPermission = 'default';

  async init(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    this.permission = Notification.permission;

    if (this.permission === 'default') {
      this.permission = await Notification.requestPermission();
    }

    return this.permission === 'granted';
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false;

    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }

  isEnabled(): boolean {
    return this.permission === 'granted';
  }

  show(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isEnabled()) return null;

    try {
      const notificationOptions = {
        icon: '/api/icon?size=192',
        badge: '/api/icon?size=96',
        ...options,
      } as NotificationOptions & { vibrate?: number[] };

      // Add vibrate for supported browsers
      if ('vibrate' in navigator) {
        notificationOptions.vibrate = [200, 100, 200];
      }

      const notification = new Notification(title, notificationOptions);

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (e) {
      console.warn('Notification failed:', e);
      return null;
    }
  }

  // Predefined notifications
  userJoined(userName: string, roomTitle: string) {
    this.show(`${userName} a rejoint l'addition`, {
      body: roomTitle || 'Une nouvelle personne a rejoint',
      tag: 'user-joined',
    });
  }

  paymentReceived(amount: string, fromUser: string) {
    this.show('Paiement reçu ! 💰', {
      body: `${fromUser} a payé ${amount}`,
      tag: 'payment-received',
    });
  }

  billFinalized(roomTitle: string) {
    this.show('Addition finalisée', {
      body: `${roomTitle || "L'addition"} est prête à être payée`,
      tag: 'bill-finalized',
    });
  }

  reminder(roomTitle: string, amount: string) {
    this.show('Rappel de paiement', {
      body: `Tu dois ${amount} pour "${roomTitle}"`,
      tag: 'payment-reminder',
    });
  }
}

export const notifications = new NotificationManager();

// React hook
import { useCallback, useEffect, useState } from 'react';

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(notifications.isEnabled());
  }, []);

  const requestPermission = useCallback(async () => {
    const granted = await notifications.requestPermission();
    setEnabled(granted);
    return granted;
  }, []);

  const show = useCallback((title: string, options?: NotificationOptions) => {
    return notifications.show(title, options);
  }, []);

  return {
    enabled,
    requestPermission,
    show,
    userJoined: notifications.userJoined.bind(notifications),
    paymentReceived: notifications.paymentReceived.bind(notifications),
    billFinalized: notifications.billFinalized.bind(notifications),
    reminder: notifications.reminder.bind(notifications),
  };
}
