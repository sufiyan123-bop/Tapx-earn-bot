"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { getAuthInstance, getDb, ensureAnonymousAuth } from "@/lib/firebase";
import { useTelegram } from "@/providers/TelegramProvider";
import type { UserDoc } from "@/types";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextValue {
  uid: string | null;
  userDoc: UserDoc | null;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({ uid: null, userDoc: null, refreshUser: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isTelegram, user: tgUser, startParam } = useTelegram();
  const [uid, setUid] = useState<string | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        const id = await ensureAnonymousAuth();
        setUid(id);
      } else {
        setUid(user.uid);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      const db = getDb();
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      const now = Date.now();
      if (!snap.exists()) {
        const referrerId = isTelegram && startParam ? startParam : undefined;
        const newUser: UserDoc = {
          userId: uid,
          name: tgUser?.first_name || "User",
          username: tgUser?.username,
          photoUrl: tgUser?.photo_url,
          balance: 0,
          totalTaps: 0,
          dailyTapCount: 0,
          vipTier: "Free",
          vipExpiry: undefined,
          referrerId,
          referralCount: 0,
          referralEarnings: 0,
          lastTapTime: undefined,
          createdAt: now,
          updatedAt: now,
          referralBonusCredited: false,
          dailyTapDate: new Date(now).toISOString().slice(0, 10),
        };
        await setDoc(ref, newUser);
        setUserDoc(newUser);
        // Increment referrer's referralCount immediately on first registration
        if (referrerId) {
          try {
            const referrerRef = doc(db, "users", referrerId);
            await updateDoc(referrerRef, { referralCount: (snap.data()?.referralCount || 0) + 1, updatedAt: now } as any);
          } catch { /* ignore if referrer does not exist yet */ }
        }
      } else {
        setUserDoc(snap.data() as UserDoc);
      }
    })();
  }, [uid, isTelegram, startParam, tgUser?.first_name, tgUser?.username, tgUser?.photo_url]);

  const refreshUser = async () => {
    if (!uid) return;
    const db = getDb();
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setUserDoc(snap.data() as UserDoc);
  };

  const memo = useMemo(() => ({ uid, userDoc, refreshUser }), [uid, userDoc]);
  return <AuthContext.Provider value={memo}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
