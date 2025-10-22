'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, User, CreditCard, Calendar } from 'lucide-react';
import { getPendingWithdrawals, processWithdrawal, getUser } from '@/lib/firestore';
import { formatCurrency } from '@/lib/utils';
import { Withdrawal } from '@/types';
import toast from 'react-hot-toast';

interface WithdrawalWithUser extends Withdrawal {
  userName?: string;
}

export default function AdminApprovals() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchWithdrawals, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const data = await getPendingWithdrawals();
      
      // Fetch user names for each withdrawal
      const withdrawalsWithUsers = await Promise.all(
        data.map(async (withdrawal) => {
          try {
            const user = await getUser(withdrawal.userId);
            return {
              ...withdrawal,
              userName: user?.name || 'Unknown User',
            };
          } catch (error) {
            return {
              ...withdrawal,
              userName: 'Unknown User',
            };
          }
        })
      );
      
      setWithdrawals(withdrawalsWithUsers);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (withdrawalId: string, status: 'paid' | 'rejected', note?: string) => {
    setProcessing(withdrawalId);
    
    try {
      await processWithdrawal(withdrawalId, status, note);
      
      // Remove from list
      setWithdrawals(prev => prev.filter(w => w.id !== withdrawalId));
      
      toast.success(
        status === 'paid' 
          ? 'Withdrawal approved and processed!' 
          : 'Withdrawal rejected'
      );
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setProcessing(null);
    }
  };

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

  return (
    <div>
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Approvals</h2>
        <p className="text-gray-400">
          Review and process withdrawal requests ({withdrawals.length} pending)
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass glow p-4 border border-orange-500/30 bg-orange-500/10">
          <div className="flex items-center">
            <Clock className="text-orange-400 mr-3" size={20} />
            <div>
              <p className="text-orange-400 font-semibold">{withdrawals.length}</p>
              <p className="text-gray-300 text-sm">Pending Requests</p>
            </div>
          </div>
        </div>
        
        <div className="glass glow p-4 border border-blue-500/30 bg-blue-500/10">
          <div className="flex items-center">
            <CreditCard className="text-blue-400 mr-3" size={20} />
            <div>
              <p className="text-blue-400 font-semibold">
                {formatCurrency(withdrawals.reduce((sum, w) => sum + w.amount, 0))}
              </p>
              <p className="text-gray-300 text-sm">Total Amount</p>
            </div>
          </div>
        </div>
        
        <div className="glass glow p-4 border border-purple-500/30 bg-purple-500/10">
          <div className="flex items-center">
            <User className="text-purple-400 mr-3" size={20} />
            <div>
              <p className="text-purple-400 font-semibold">
                {new Set(withdrawals.map(w => w.userId)).size}
              </p>
              <p className="text-gray-300 text-sm">Unique Users</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Withdrawal Requests */}
      {withdrawals.length === 0 ? (
        <motion.div
          className="glass glow p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CheckCircle className="text-green-400 mx-auto mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
          <p className="text-gray-400">No pending withdrawal requests at the moment.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {withdrawals.map((withdrawal, index) => (
              <motion.div
                key={withdrawal.id}
                className="glass glow p-6 border border-gray-600/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Withdrawal Info */}
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <User className="text-blue-400 mr-2" size={18} />
                      <span className="font-semibold text-white">{withdrawal.userName}</span>
                      <span className="ml-2 px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                        ID: {withdrawal.userId}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-gray-400 text-sm">Amount</p>
                        <p className="text-green-400 font-bold text-lg">
                          {formatCurrency(withdrawal.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">UPI ID</p>
                        <p className="text-white font-mono text-sm break-all">
                          {withdrawal.upiId}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Requested</p>
                        <div className="flex items-center">
                          <Calendar className="text-purple-400 mr-1" size={14} />
                          <p className="text-purple-400 text-sm">
                            {withdrawal.createdAt.toLocaleDateString()} {withdrawal.createdAt.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={() => handleApproval(withdrawal.id, 'paid')}
                      disabled={processing === withdrawal.id}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 font-semibold rounded-lg transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <CheckCircle className="mr-2" size={16} />
                        {processing === withdrawal.id ? 'Processing...' : 'Approve'}
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => handleApproval(withdrawal.id, 'rejected', 'Rejected by admin')}
                      disabled={processing === withdrawal.id}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold rounded-lg transition-all disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <XCircle className="mr-2" size={16} />
                        Reject
                      </div>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Refresh Info */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-gray-500 text-sm">
          Auto-refresh every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </motion.div>
    </div>
  );
}