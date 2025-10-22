'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Award } from 'lucide-react';
import { User } from '@/types';
import { processTap, VIP_TIERS } from '@/lib/firestore';
import { formatCurrency } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';
import { useUser } from '@/hooks/useUser';
import toast from 'react-hot-toast';

interface TapToEarnProps {
  user: User;
}

export default function TapToEarn({ user }: TapToEarnProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [coinParticles, setCoinParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { hapticFeedback, notificationFeedback } = useTelegram();
  const { refreshUser } = useUser();

  const tier = VIP_TIERS[user.vipTier];
  const progressPercent = Math.min((user.dailyTapCount / tier.dailyTapLimit) * 100, 100);
  const canTap = user.dailyTapCount < tier.dailyTapLimit;

  const handleTap = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!canTap || isAnimating) return;

    setIsAnimating(true);
    hapticFeedback('medium');

    // Create coin particle animation
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const newParticle = {
      id: Date.now(),
      x: centerX,
      y: centerY,
    };
    
    setCoinParticles(prev => [...prev, newParticle]);

    try {
      const result = await processTap(user.userId);
      
      if (result.success && result.earnings) {
        toast.success(`+${formatCurrency(result.earnings)} earned!`);
        notificationFeedback('success');
        await refreshUser();
      } else {
        toast.error(result.message || 'Tap failed');
        notificationFeedback('error');
      }
    } catch (error) {
      console.error('Tap error:', error);
      toast.error('Something went wrong');
      notificationFeedback('error');
    }

    // Remove particle after animation
    setTimeout(() => {
      setCoinParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 600);

    setTimeout(() => setIsAnimating(false), 200);
  };

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
          TapX Earnings
        </h1>
        <p className="text-gray-300">Tap to earn {formatCurrency(0.002 * tier.multiplier)} per tap</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          className="glass glow p-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-center mb-2">
            <Zap className="text-yellow-400 mr-2" size={20} />
            <span className="text-sm text-gray-300">Balance</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{formatCurrency(user.balance)}</p>
        </motion.div>

        <motion.div
          className="glass glow p-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-2">
            <Target className="text-blue-400 mr-2" size={20} />
            <span className="text-sm text-gray-300">Total Taps</span>
          </div>
          <p className="text-xl font-bold text-blue-400">{user.totalTaps.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* VIP Status */}
      <motion.div
        className="glass glow p-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Award className="text-purple-400 mr-2" size={20} />
            <span className="text-sm text-gray-300">VIP Status</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            user.vipTier === 'free' 
              ? 'bg-gray-600 text-gray-300' 
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          }`}>
            {user.vipTier.toUpperCase()}
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-2">
          Multiplier: {tier.multiplier}x | Daily Limit: {tier.dailyTapLimit}
        </p>
        
        {/* Progress Bar */}
        <div className="progress-bar mb-2">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
        </div>
        <p className="text-xs text-gray-400">
          {user.dailyTapCount} / {tier.dailyTapLimit} taps today
        </p>
      </motion.div>

      {/* Tap Button */}
      <div className="flex-1 flex items-center justify-center relative">
        <motion.button
          onClick={handleTap}
          disabled={!canTap}
          className={`tap-button flex items-center justify-center ${
            !canTap ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          whileHover={canTap ? { scale: 1.05 } : {}}
          whileTap={canTap ? { scale: 0.95 } : {}}
          animate={isAnimating ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          } : {}}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="text-white text-6xl font-bold"
            animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
          >
            💰
          </motion.div>
        </motion.button>

        {/* Coin Particles */}
        <AnimatePresence>
          {coinParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="coin-particle fixed pointer-events-none z-50"
              style={{
                left: particle.x - 10,
                top: particle.y - 10,
              }}
              initial={{ scale: 0, y: 0, opacity: 1 }}
              animate={{
                scale: [0, 1, 0],
                y: -100,
                opacity: [1, 1, 0],
                x: Math.random() * 60 - 30,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              💰
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tap Instruction */}
      <motion.div
        className="text-center mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {canTap ? (
          <p className="text-gray-300">Tap the coin to earn money!</p>
        ) : (
          <div className="glass p-4 rounded-lg">
            <p className="text-red-400 font-semibold mb-2">Daily Limit Reached!</p>
            <p className="text-gray-300 text-sm">
              Upgrade to VIP for higher limits or wait for tomorrow
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}