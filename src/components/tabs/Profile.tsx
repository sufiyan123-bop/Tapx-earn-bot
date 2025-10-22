'use client';

import { motion } from 'framer-motion';
import { User as UserIcon, Crown, Target, Users, Calendar, Award } from 'lucide-react';
import { User } from '@/types';
import { VIP_TIERS } from '@/lib/firestore';
import { formatCurrency, getDaysUntilExpiry, isVipExpired } from '@/lib/utils';
import { useTelegram } from '@/hooks/useTelegram';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const { user: telegramUser } = useTelegram();
  const tier = VIP_TIERS[user.vipTier];
  const vipExpired = isVipExpired(user.vipExpiry);
  const daysLeft = getDaysUntilExpiry(user.vipExpiry);

  const stats = [
    {
      icon: Target,
      label: 'Total Taps',
      value: user.totalTaps.toLocaleString(),
      color: 'text-blue-400',
    },
    {
      icon: Users,
      label: 'Referrals',
      value: user.referralCount.toString(),
      color: 'text-purple-400',
    },
    {
      icon: Award,
      label: 'Total Earned',
      value: formatCurrency(user.balance + user.referralEarnings),
      color: 'text-green-400',
    },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          Profile
        </h1>
        <p className="text-gray-300">Your TapX journey overview</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        className="glass glow p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-4 mb-6">
          {/* Profile Picture */}
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {telegramUser?.photo_url ? (
              <img
                src={telegramUser.photo_url}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <UserIcon size={32} className="text-white" />
            )}
          </motion.div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user.name}</h2>
            {user.username && (
              <p className="text-gray-400 text-sm">@{user.username}</p>
            )}
            <p className="text-gray-500 text-xs">
              Member since {user.createdAt.toLocaleDateString()}
            </p>
          </div>

          {/* VIP Badge */}
          <motion.div
            className={`vip-badge px-4 py-2 rounded-lg ${
              user.vipTier === 'free'
                ? 'bg-gray-600'
                : 'bg-gradient-to-r from-purple-500 to-pink-500'
            }`}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-center">
              <Crown className="mr-1" size={16} />
              <span className="text-sm font-bold">
                {user.vipTier.toUpperCase()}
              </span>
            </div>
          </motion.div>
        </div>

        {/* VIP Status */}
        {user.vipTier !== 'free' && (
          <motion.div
            className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 font-semibold text-sm">VIP Status</p>
                <p className="text-gray-300 text-xs">
                  {tier.multiplier}x multiplier • {tier.dailyTapLimit} daily taps
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center">
                  <Calendar className="text-blue-400 mr-1" size={14} />
                  <span className="text-sm text-gray-300">
                    {vipExpired ? 'Expired' : `${daysLeft} days left`}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className="glass glow p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon className={`${stat.color} mr-3`} size={24} />
                  <div>
                    <p className="text-gray-300 text-sm">{stat.label}</p>
                    <motion.p
                      className={`text-2xl font-bold ${stat.color}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Balance Breakdown */}
      <motion.div
        className="glass glow p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-lg font-bold mb-4">Balance Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Tap Earnings</span>
            <span className="text-green-400 font-semibold">
              {formatCurrency(user.balance)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Referral Earnings</span>
            <span className="text-purple-400 font-semibold">
              {formatCurrency(user.referralEarnings)}
            </span>
          </div>
          <div className="border-t border-gray-600 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Total Earned</span>
              <span className="text-yellow-400 font-bold text-lg">
                {formatCurrency(user.balance + user.referralEarnings)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Achievement Section */}
      <motion.div
        className="glass glow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <Award className="text-yellow-400 mr-2" size={20} />
          Achievements
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Tap Milestones */}
          <div className={`p-3 rounded-lg border ${
            user.totalTaps >= 1000 
              ? 'bg-green-500/20 border-green-500/30' 
              : 'bg-gray-700/30 border-gray-600/30'
          }`}>
            <p className="text-sm font-semibold">First 1K Taps</p>
            <p className="text-xs text-gray-400">
              {user.totalTaps >= 1000 ? '✅ Completed' : `${user.totalTaps}/1000`}
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${
            user.referralCount >= 5 
              ? 'bg-purple-500/20 border-purple-500/30' 
              : 'bg-gray-700/30 border-gray-600/30'
          }`}>
            <p className="text-sm font-semibold">5 Referrals</p>
            <p className="text-xs text-gray-400">
              {user.referralCount >= 5 ? '✅ Completed' : `${user.referralCount}/5`}
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${
            user.vipTier !== 'free' 
              ? 'bg-yellow-500/20 border-yellow-500/30' 
              : 'bg-gray-700/30 border-gray-600/30'
          }`}>
            <p className="text-sm font-semibold">VIP Member</p>
            <p className="text-xs text-gray-400">
              {user.vipTier !== 'free' ? '✅ Active' : 'Not yet'}
            </p>
          </div>

          <div className={`p-3 rounded-lg border ${
            user.balance >= 100 
              ? 'bg-blue-500/20 border-blue-500/30' 
              : 'bg-gray-700/30 border-gray-600/30'
          }`}>
            <p className="text-sm font-semibold">₹100 Earned</p>
            <p className="text-xs text-gray-400">
              {user.balance >= 100 ? '✅ Completed' : `₹${user.balance.toFixed(2)}/₹100`}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}