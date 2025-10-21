"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { WebApp as TelegramWebAppType } from "@twa-dev/sdk";

interface TelegramContextValue {
  isTelegram: boolean;
  webApp: TelegramWebAppType | null;
  startParam?: string;
  user?: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
}

const TelegramContext = createContext<TelegramContextValue>({ isTelegram: false, webApp: null });

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [value, setValue] = useState<TelegramContextValue>({ isTelegram: false, webApp: null });

  useEffect(() => {
    const tg = (typeof window !== "undefined" ? (window as any).Telegram?.WebApp : undefined) as TelegramWebAppType | undefined;
    if (!tg) {
      setValue({ isTelegram: false, webApp: null });
      return;
    }
    try {
      tg.ready();
    } catch {}
    const startParam: string | undefined = (tg.initDataUnsafe as any)?.start_param || undefined;
    const user = (tg.initDataUnsafe as any)?.user;
    setValue({ isTelegram: true, webApp: tg, startParam, user });
  }, []);

  const memo = useMemo(() => value, [value]);
  return <TelegramContext.Provider value={memo}>{children}</TelegramContext.Provider>;
}

export function useTelegram() {
  return useContext(TelegramContext);
}
