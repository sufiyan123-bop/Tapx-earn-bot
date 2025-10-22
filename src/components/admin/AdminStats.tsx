'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, DollarSign, CreditCard, TrendingUp, Clock } from 'lucide-react';
import { getAdminStats } from '@/lib/firestore';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface AdminStatsData {
  totalUsers: number;
  activeVips: number;
  totalInrGenerated: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
}

export default function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-400">
        <p>Failed to load statistics</p>
      </div>
    );
  }

  const statCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: formatNumber(stats.totalUsers),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: Crown,
      label: 'Active VIPs',
      value: formatNumber(stats.activeVips),
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      borderColor: 'border-purple-500/30',
    },
    {
      icon: DollarSign,
      label: 'Total INR Generated',
      value: formatCurrency(stats.totalInrGenerated),
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
    },
    {
      icon: CreditCard,
      label: 'Total Withdrawals',
      value: formatNumber(stats.totalWithdrawals),
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
    },
    {
      icon: Clock,
      label: 'Pending Withdrawals',
      value: formatNumber(stats.pendingWithdrawals),
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      borderColor: 'border-orange-500/30',
    },
    {
      icon: TrendingUp,
      label: 'VIP Conversion Rate',
      value: stats.totalUsers > 0 ? `${((stats.activeVips / stats.totalUsers) * 100).toFixed(1)}%` : '0%',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
      borderColor: 'border-pink-500/30',
    },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Dashboard Statistics</h2>
        <p className="text-gray-400">Real-time overview of TapX performance</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              className={`glass glow p-6 border ${stat.borderColor} ${stat.bgColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={stat.color} size={24} />
                <motion.div
                  className={`w-2 h-2 ${stat.color.replace('text-', 'bg-')} rounded-full`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <h3 className="text-gray-300 text-sm font-medium mb-2">{stat.label}</h3>
              <motion.p
                className={`text-3xl font-bold ${stat.color}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
              >
                {stat.value}
              </motion.p>
            </motion.div>
          );
        })}
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div
          className="glass glow p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <TrendingUp className="text-green-400 mr-2" size={20} />
            Platform Health
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">User Engagement</span>
              <span className="text-green-400 font-semibold">
                {stats.totalUsers > 0 ? 'Active' : 'Starting'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Revenue Stream</span>
              <span className="text-blue-400 font-semibold">
                {stats.activeVips > 0 ? 'Generating' : 'Pending'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Withdrawal Queue</span>
              <span className={`font-semibold ${
                stats.pendingWithdrawals === 0 ? 'text-green-400' : 'text-orange-400'
              }`}>
                {stats.pendingWithdrawals === 0 ? 'Clear' : `${stats.pendingWithdrawals} Pending`}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="glass glow p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center">
            <Clock className="text-purple-400 mr-2" size={20} />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <motion.button
              className="w-full py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 text-sm transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              View All Users
            </motion.button>
            <motion.button
              className="w-full py-2 px-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-400 text-sm transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Export Data
            </motion.button>
            <motion.button
              className="w-full py-2 px-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-400 text-sm transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              System Logs
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Last Updated */}
      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p className="text-gray-500 text-sm">
          Last updated: {new Date().toLocaleString()} • Auto-refresh: 30s
        </p>
      </motion.div>
    </div>
  );
}