import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Withdrawal, AppSettings, VipTier } from '@/types';

// VIP Tier Configuration
export const VIP_TIERS: Record<string, VipTier> = {
  free: {
    tier: 'free',
    price: 0,
    multiplier: 1.0,
    dailyTapLimit: 1000,
    withdrawalLimit: 1,
    minWithdrawal: 200
  },
  vip1: {
    tier: 'vip1',
    price: 75,
    multiplier: 2.0,
    dailyTapLimit: 5000,
    withdrawalLimit: 3,
    minWithdrawal: 250
  },
  vip2: {
    tier: 'vip2',
    price: 150,
    multiplier: 2.5,
    dailyTapLimit: 10000,
    withdrawalLimit: 5,
    minWithdrawal: 500
  }
};

// User Functions
export async function createUser(userData: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', userData.userId!);
  await setDoc(userRef, {
    ...userData,
    balance: 0,
    totalTaps: 0,
    dailyTapCount: 0,
    vipTier: 'free',
    referralCount: 0,
    referralEarnings: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate(),
      vipExpiry: data.vipExpiry?.toDate(),
      lastTapTime: data.lastTapTime?.toDate(),
    } as User;
  }
  return null;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, updates);
}

// Tap Functions
export async function processTap(userId: string): Promise<{ success: boolean; earnings?: number; message?: string }> {
  const user = await getUser(userId);
  if (!user) return { success: false, message: 'User not found' };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastTap = user.lastTapTime ? new Date(user.lastTapTime) : null;
  const lastTapDate = lastTap ? new Date(lastTap.getFullYear(), lastTap.getMonth(), lastTap.getDate()) : null;

  // Reset daily count if it's a new day
  let dailyTapCount = user.dailyTapCount;
  if (!lastTapDate || lastTapDate < today) {
    dailyTapCount = 0;
  }

  // Check daily limit
  const tier = VIP_TIERS[user.vipTier];
  if (dailyTapCount >= tier.dailyTapLimit) {
    return { success: false, message: 'Daily limit reached!' };
  }

  // Calculate earnings
  const settings = await getSettings();
  const earnings = settings.baseTapValue * tier.multiplier;

  // Update user
  await updateUser(userId, {
    balance: user.balance + earnings,
    totalTaps: user.totalTaps + 1,
    dailyTapCount: dailyTapCount + 1,
    lastTapTime: now,
  });

  return { success: true, earnings };
}

// VIP Functions
export async function activateSubscription(userId: string, tier: 'vip1' | 'vip2', durationDays: number = 30): Promise<void> {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + durationDays);
  
  await updateUser(userId, {
    vipTier: tier,
    vipExpiry: expiry,
  });
}

export function getMultiplier(tier: string): number {
  return VIP_TIERS[tier]?.multiplier || 1.0;
}

export function getDailyLimit(tier: string): number {
  return VIP_TIERS[tier]?.dailyTapLimit || 1000;
}

// Referral Functions
export async function countReferral(userId: string, referrerId: string): Promise<void> {
  const settings = await getSettings();
  
  // Update referrer's stats
  await updateUser(referrerId, {
    referralCount: increment(1),
    referralEarnings: increment(settings.referralBonus),
    balance: increment(settings.referralBonus),
  });
}

// Withdrawal Functions
export async function createWithdrawal(userId: string, amount: number, upiId: string): Promise<string> {
  const withdrawalRef = doc(collection(db, 'withdrawals'));
  await setDoc(withdrawalRef, {
    userId,
    amount,
    upiId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return withdrawalRef.id;
}

export async function processWithdrawal(withdrawalId: string, status: 'paid' | 'rejected', adminNote?: string): Promise<void> {
  const withdrawalRef = doc(db, 'withdrawals', withdrawalId);
  await updateDoc(withdrawalRef, {
    status,
    processedAt: serverTimestamp(),
    adminNote: adminNote || '',
  });
}

export async function getPendingWithdrawals(): Promise<Withdrawal[]> {
  const q = query(
    collection(db, 'withdrawals'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    processedAt: doc.data().processedAt?.toDate(),
  })) as Withdrawal[];
}

// Settings Functions
export async function getSettings(): Promise<AppSettings> {
  const settingsRef = doc(db, 'settings', 'app');
  const settingsSnap = await getDoc(settingsRef);
  
  if (settingsSnap.exists()) {
    return settingsSnap.data() as AppSettings;
  }
  
  // Default settings
  const defaultSettings: AppSettings = {
    baseTapValue: 0.002,
    referralBonus: 1,
    vip1Multiplier: 2.0,
    vip2Multiplier: 2.5,
    vip1Limit: 5000,
    vip2Limit: 10000,
    inrExchangeRate: 1,
    secretKey: 'tapx-admin-2024',
  };
  
  await setDoc(settingsRef, defaultSettings);
  return defaultSettings;
}

export async function updateSettings(updates: Partial<AppSettings>): Promise<void> {
  const settingsRef = doc(db, 'settings', 'app');
  await updateDoc(settingsRef, updates);
}

// Admin Stats
export async function getAdminStats() {
  const usersQuery = query(collection(db, 'users'));
  const withdrawalsQuery = query(collection(db, 'withdrawals'));
  
  const [usersSnapshot, withdrawalsSnapshot] = await Promise.all([
    getDocs(usersQuery),
    getDocs(withdrawalsQuery)
  ]);
  
  const users = usersSnapshot.docs.map(doc => doc.data() as User);
  const withdrawals = withdrawalsSnapshot.docs.map(doc => doc.data() as Withdrawal);
  
  const totalUsers = users.length;
  const activeVips = users.filter(user => 
    user.vipTier !== 'free' && 
    user.vipExpiry && 
    new Date(user.vipExpiry) > new Date()
  ).length;
  
  const totalInrGenerated = users.reduce((sum, user) => sum + user.balance, 0);
  const totalWithdrawals = withdrawals.filter(w => w.status === 'paid').length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
  
  return {
    totalUsers,
    activeVips,
    totalInrGenerated,
    totalWithdrawals,
    pendingWithdrawals,
  };
}