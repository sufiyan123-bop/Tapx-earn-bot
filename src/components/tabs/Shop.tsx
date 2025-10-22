'use client';

import { motion } from 'framer-motion';
import { Crown, Star, Zap, Target, CreditCard, Calendar } from 'lucide-react';
import { User } from '@/types';
import { VIP_TIERS, activateSubscription } from '@/lib/firestore';
import { formatCurrency, getDaysUntilExpiry, isVipExpired } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import toast from 'react-hot-toast';

interface ShopProps {
  user: User;
}

export default function Shop({ user }: ShopProps) {
  const { refreshUser } = useUser();
  const currentVipExpired = isVipExpired(user.vipExpiry);
  const daysLeft = getDaysUntilExpiry(user.vipExpiry);

  const handlePurchase = async (tier: 'vip1' | 'vip2') => {
    try {
      // In a real app, you would integrate with Telegram Stars payment
      // For now, we'll simulate the purchase
      toast.success('Payment processing...');
      
      // Simulate payment delay
      setTimeout(async () => {
        try {
          await activateSubscription(user.userId, tier, 30);
          await refreshUser();
          toast.success(`${tier.toUpperCase()} activated successfully! 🎉`);
        } catch (error) {
          toast.error('Failed to activate VIP');
        }
      }, 2000);
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const VipCard = ({ tier, isActive = false }: { tier: keyof typeof VIP_TIERS; isActive?: boolean }) => {
    const tierData = VIP_TIERS[tier];
    
    if (tier === 'free') return null;

    const isCurrentTier = user.vipTier === tier && !currentVipExpired;
    
    return (
      <motion.div
        className={`glass glow p-6 rounded-xl relative overflow-hidden ${
          isCurrentTier ? 'ring-2 ring-yellow-400' : ''
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: tier === 'vip1' ? 0.1 : 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* VIP Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Crown className={`mr-2 ${tier === 'vip1' ? 'text-purple-400' : 'text-yellow-400'}`} size={24} />
            <h3 className="text-xl font-bold">{tier.toUpperCase()}</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            tier === 'vip1' 
              ? 'bg-gradient-to-r from-purple-500 to-purple-600' 
              : 'bg-gradient-to-r from-yellow-500 to-orange-500'
          } text-white`}>
            {tierData.price} Stars
          </div>
        </div>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm">
            <Zap className="text-green-400 mr-2" size={16} />
            <span className="text-gray-300">{tierData.multiplier}x Multiplier</span>
          </div>
          <div className="flex items-center text-sm">
            <Target className="text-blue-400 mr-2" size={16} />
            <span className="text-gray-300">{tierData.dailyTapLimit.toLocaleString()} Daily Taps</span>
          </div>
          <div className="flex items-center text-sm">
            <CreditCard className="text-purple-400 mr-2" size={16} />
            <span className="text-gray-300">{tierData.withdrawalLimit} Withdrawals/day</span>
          </div>
          <div className="flex items-center text-sm">
            <Star className="text-yellow-400 mr-2" size={16} />
            <span className="text-gray-300">Min withdrawal: {formatCurrency(tierData.minWithdrawal)}</span>
          </div>
        </div>

        {/* Action Button */}
        {isCurrentTier ? (
          <div className="text-center">
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-3">
              <p className="text-green-400 font-semibold text-sm">Active VIP</p>
              <p className="text-gray-300 text-xs">
                {daysLeft > 0 ? `${daysLeft} days remaining` : 'Expired'}
              </p>
            </div>
          </div>
        ) : (
          <motion.button
            onClick={() => handlePurchase(tier)}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
              tier === 'vip1'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
            } text-white`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Buy with Stars
          </motion.button>
        )}

        {/* Animated Background */}
        <motion.div
          className={`absolute inset-0 opacity-5 ${
            tier === 'vip1' ? 'bg-purple-500' : 'bg-yellow-500'
          }`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-yellow-500 bg-clip-text text-transparent mb-2">
          VIP Shop
        </h1>
        <p className="text-gray-300">Upgrade your account for better rewards</p>
      </motion.div>

      {/* Current Status */}
      <motion.div
        className="glass glow p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Current Status</h3>
            <div className="flex items-center">
              <Crown className="text-yellow-400 mr-2" size={20} />
              <span className={`font-semibold ${
                user.vipTier === 'free' ? 'text-gray-400' : 'text-yellow-400'
              }`}>
                {user.vipTier.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center mb-1">
              <Calendar className="text-blue-400 mr-2" size={16} />
              <span className="text-sm text-gray-300">
                {user.vipTier === 'free' 
                  ? 'No expiry' 
                  : currentVipExpired 
                    ? 'Expired' 
                    : `${daysLeft} days left`
                }
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Multiplier: {VIP_TIERS[user.vipTier].multiplier}x
            </p>
          </div>
        </div>
      </motion.div>

      {/* VIP Plans */}
      <div className="space-y-6 mb-8">
        <VipCard tier="vip1" />
        <VipCard tier="vip2" />
      </div>

      {/* Benefits Info */}
      <motion.div
        className="glass glow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Star className="text-yellow-400 mr-2" size={20} />
          VIP Benefits
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-purple-400">Enhanced Earning</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Higher tap multipliers</li>
              <li>• Increased daily limits</li>
              <li>• Priority support</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-yellow-400">Better Withdrawals</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• More daily withdrawals</li>
              <li>• Lower minimum amounts</li>
              <li>• Faster processing</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}