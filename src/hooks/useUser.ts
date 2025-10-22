import { useState, useEffect } from 'react';
import { User } from '@/types';
import { getUser, createUser, countReferral } from '@/lib/firestore';
import { useTelegram } from './useTelegram';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: telegramUser, getReferrerId } = useTelegram();

  useEffect(() => {
    async function initializeUser() {
      if (!telegramUser) {
        setLoading(false);
        return;
      }

      try {
        const userId = telegramUser.id.toString();
        let userData = await getUser(userId);

        if (!userData) {
          // Create new user
          const referrerId = getReferrerId();
          
          userData = {
            userId,
            name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
            username: telegramUser.username,
            balance: 0,
            totalTaps: 0,
            dailyTapCount: 0,
            vipTier: 'free' as const,
            referrerId,
            referralCount: 0,
            referralEarnings: 0,
            createdAt: new Date(),
          };

          await createUser(userData);

          // Process referral if exists
          if (referrerId) {
            await countReferral(userId, referrerId);
          }
        }

        setUser(userData);
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setLoading(false);
      }
    }

    initializeUser();
  }, [telegramUser, getReferrerId]);

  const refreshUser = async () => {
    if (user) {
      const updatedUser = await getUser(user.userId);
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
  };

  return { user, loading, refreshUser };
}