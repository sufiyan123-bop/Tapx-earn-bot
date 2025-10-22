export type VipTier = "Free" | "VIP1" | "VIP2";

export interface UserDoc {
  userId: string;
  name: string;
  username?: string;
  photoUrl?: string;
  balance: number; // INR
  totalTaps: number;
  dailyTapCount: number;
  dailyTapDate?: string; // YYYY-MM-DD to reset daily counter
  vipTier: VipTier;
  vipExpiry?: number; // millis since epoch
  referrerId?: string;
  referralCount: number;
  referralEarnings: number; // INR
  lastTapTime?: number; // millis
  createdAt: number;
  updatedAt: number;
  referralBonusCredited?: boolean; // for reaching 100 taps
}

export interface WithdrawalDoc {
  id?: string;
  userId: string;
  amount: number; // INR
  upiId: string;
  status: "pending" | "paid" | "rejected";
  createdAt: number;
  processedAt?: number;
}

export interface SettingsDoc {
  baseTapValue: number; // INR per tap base
  referralBonus: number; // INR per successful referral
  vip1Multiplier: number;
  vip2Multiplier: number;
  freeLimit: number; // daily taps
  vip1Limit: number;
  vip2Limit: number;
  inrExchangeRate?: number;
  minWithdrawalFree: number;
  minWithdrawalVip1: number;
  minWithdrawalVip2: number;
  withdrawalLimitFree: number; // per day
  withdrawalLimitVip1: number;
  withdrawalLimitVip2: number;
}
