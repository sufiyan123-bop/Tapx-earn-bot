import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "./firebase";
import type { SettingsDoc, VipTier } from "@/types";

export const DEFAULT_SETTINGS: SettingsDoc = {
  baseTapValue: 0.002,
  referralBonus: 1,
  vip1Multiplier: 2.0,
  vip2Multiplier: 2.5,
  freeLimit: 1000,
  vip1Limit: 5000,
  vip2Limit: 10000,
  inrExchangeRate: 1,
  minWithdrawalFree: 200,
  minWithdrawalVip1: 250,
  minWithdrawalVip2: 500,
  withdrawalLimitFree: 1,
  withdrawalLimitVip1: 3,
  withdrawalLimitVip2: 5,
};

export async function getSettings(): Promise<SettingsDoc> {
  const db = getDb();
  const ref = doc(db, "settings", "app");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  return { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<SettingsDoc>) } as SettingsDoc;
}

export function getMultiplierForTier(tier: VipTier, settings: SettingsDoc): number {
  if (tier === "VIP1") return settings.vip1Multiplier;
  if (tier === "VIP2") return settings.vip2Multiplier;
  return 1.0;
}

export function getDailyLimitForTier(tier: VipTier, settings: SettingsDoc): number {
  if (tier === "VIP1") return settings.vip1Limit;
  if (tier === "VIP2") return settings.vip2Limit;
  return settings.freeLimit;
}

export function getMinWithdrawalForTier(tier: VipTier, settings: SettingsDoc): number {
  if (tier === "VIP1") return settings.minWithdrawalVip1;
  if (tier === "VIP2") return settings.minWithdrawalVip2;
  return settings.minWithdrawalFree;
}

export function getDailyWithdrawalLimitForTier(tier: VipTier, settings: SettingsDoc): number {
  if (tier === "VIP1") return settings.withdrawalLimitVip1;
  if (tier === "VIP2") return settings.withdrawalLimitVip2;
  return settings.withdrawalLimitFree;
}
