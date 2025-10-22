'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { User } from '@/types';
import { VIP_TIERS, createWithdrawal } from '@/lib/firestore';
import { formatCurrency, validateUPI } from '@/lib/utils';
import { useUser } from '@/hooks/useUser';
import toast from 'react-hot-toast';

interface WithdrawProps {
  user: User;
}

export default function Withdraw({ user }: WithdrawProps) {
  const [upiId, setUpiId] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshUser } = useUser();

  const tier = VIP_TIERS[user.vipTier];
  const minWithdrawal = tier.minWithdrawal;
  const maxWithdrawal = Math.min(user.balance, 10000); // Max ₹10,000 per withdrawal

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUPI(upiId)) {
      toast.error('Please enter a valid UPI ID');
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    
    if (withdrawalAmount < minWithdrawal) {
      toast.error(`Minimum withdrawal is ${formatCurrency(minWithdrawal)}`);
      return;
    }

    if (withdrawalAmount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsSubmitting(true);

    try {
      await createWithdrawal(user.userId, withdrawalAmount, upiId);
      
      // Deduct amount from user balance
      await refreshUser();
      
      toast.success('Withdrawal request submitted successfully!');
      setUpiId('');
      setAmount('');
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Withdraw Earnings
        </h1>
        <p className="text-gray-300">Cash out your earnings to UPI</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        className="glass glow p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Available Balance</h3>
          <motion.p
            className="text-4xl font-bold text-green-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {formatCurrency(user.balance)}
          </motion.p>
          <p className="text-gray-400 text-sm mt-2">
            VIP {user.vipTier.toUpperCase()} • Min: {formatCurrency(minWithdrawal)}
          </p>
        </div>
      </motion.div>

      {/* Withdrawal Form */}
      <motion.div
        className="glass glow p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@paytm"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Enter your UPI ID (e.g., 9876543210@paytm, name@gpay)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Min: ${minWithdrawal}`}
              min={minWithdrawal}
              max={maxWithdrawal}
              step="0.01"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              required
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Min: {formatCurrency(minWithdrawal)}</span>
              <span>Max: {formatCurrency(maxWithdrawal)}</span>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting || user.balance < minWithdrawal}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-center">
              <CreditCard className="mr-2" size={18} />
              {isSubmitting ? 'Processing...' : 'Submit Withdrawal'}
            </div>
          </motion.button>
        </form>
      </motion.div>

      {/* Quick Amount Buttons */}
      <motion.div
        className="glass glow p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold mb-4">Quick Amounts</h3>
        <div className="grid grid-cols-2 gap-3">
          {[minWithdrawal, 500, 1000, Math.min(user.balance, 2000)].map((quickAmount) => (
            <motion.button
              key={quickAmount}
              onClick={() => setAmount(quickAmount.toString())}
              disabled={quickAmount > user.balance}
              className="py-2 px-4 bg-gray-700/50 hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {formatCurrency(quickAmount)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Withdrawal Info */}
      <motion.div
        className="glass glow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <AlertCircle className="text-yellow-400 mr-2" size={20} />
          Withdrawal Information
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start">
            <Clock className="text-blue-400 mr-2 mt-0.5" size={16} />
            <div>
              <p className="font-medium">Processing Time</p>
              <p className="text-gray-400">24-48 hours for manual review</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="text-green-400 mr-2 mt-0.5" size={16} />
            <div>
              <p className="font-medium">Daily Limits</p>
              <p className="text-gray-400">
                VIP {user.vipTier.toUpperCase()}: {tier.withdrawalLimit} withdrawals per day
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <CreditCard className="text-purple-400 mr-2 mt-0.5" size={16} />
            <div>
              <p className="font-medium">Payment Method</p>
              <p className="text-gray-400">UPI only • No fees</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}