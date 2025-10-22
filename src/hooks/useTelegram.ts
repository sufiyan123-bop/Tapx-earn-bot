import { useEffect, useState } from 'react';
import { TelegramWebApp } from '@/types';

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user);
      
      tg.ready();
      tg.expand();
      setIsReady(true);
    }
  }, []);

  const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.impactOccurred(type);
    }
  };

  const notificationFeedback = (type: 'error' | 'success' | 'warning') => {
    if (webApp?.HapticFeedback) {
      webApp.HapticFeedback.notificationOccurred(type);
    }
  };

  const getReferrerId = (): string | null => {
    return webApp?.initDataUnsafe?.start_param || null;
  };

  return {
    webApp,
    user,
    isReady,
    hapticFeedback,
    notificationFeedback,
    getReferrerId,
  };
}