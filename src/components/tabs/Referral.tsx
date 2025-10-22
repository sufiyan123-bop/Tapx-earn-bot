'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, Star, Gift } from 'lucide-react';
import { User } from '@/types';
import { generateReferralLink, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ReferralProps {
  user: User;
}

export default function Referral({ user }: ReferralProps) {
  const [copied, setCopied] = useState(false);
  const referralLink = generateReferralLink(user.userId);

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
          Referral System
        </h1>
        <p className="text-gray-300">Invite friends and earn ₹1 for each referral</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          className="glass glow p-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-center mb-3">
            <Users className="text-blue-400 mr-2" size={24} />
            <span className="text-sm text-gray-300">Total Invites</span>
          </div>
          <motion.p
            className="text-3xl font-bold text-blue-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {user.referralCount}
          </motion.p>
          
          {/* Floating stars animation */}
          <div className="relative mt-2">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-yellow-400"
                style={{
                  left: `${20 + i * 20}%`,
                  top: -10,
                }}
                animate={{
                  y: [-5, 5, -5],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                <Star size={12} fill="currentColor" />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="glass glow p-6 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-center mb-3">
            <Gift className="text-green-400 mr-2" size={24} />
            <span className="text-sm text-gray-300">Referral Earnings</span>
          </div>
          <motion.p
            className="text-3xl font-bold text-green-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            {formatCurrency(user.referralEarnings)}
          </motion.p>
        </motion.div>
      </div>

      {/* How it works */}
      <motion.div
        className="glass glow p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Gift className="text-yellow-400 mr-2" size={20} />
          How Referrals Work
        </h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
              1
            </div>
            <p className="text-gray-300 text-sm">Share your referral link with friends</p>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
              2
            </div>
            <p className="text-gray-300 text-sm">They join TapX using your link</p>
          </div>
          <div className="flex items-start">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
              3
            </div>
            <p className="text-gray-300 text-sm">After 100 valid taps, you earn ₹1</p>
          </div>
        </div>
      </motion.div>

      {/* Referral Link */}
      <motion.div
        className="glass glow p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold mb-4">Your Referral Link</h3>
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-300 break-all font-mono">
            {referralLink}
          </p>
        </div>
        
        <motion.button
          onClick={copyReferralLink}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-center">
            <Copy className="mr-2" size={18} />
            {copied ? 'Copied!' : 'Copy Referral Link'}
          </div>
        </motion.button>
      </motion.div>

      {/* Bonus Info */}
      <motion.div
        className="glass glow p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center">
          <motion.div
            className="text-4xl mb-3"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎉
          </motion.div>
          <h3 className="text-lg font-bold mb-2">Earn More with VIP!</h3>
          <p className="text-gray-300 text-sm">
            VIP users get higher tap limits and better withdrawal rates. 
            Upgrade in the VIP Shop to maximize your earnings!
          </p>
        </div>
      </motion.div>
    </div>
  );
}