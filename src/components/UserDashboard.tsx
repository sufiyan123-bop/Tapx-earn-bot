'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  User 
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useTelegram } from '@/hooks/useTelegram';
import LoadingScreen from './LoadingScreen';
import TapToEarn from './tabs/TapToEarn';
import Referral from './tabs/Referral';
import Shop from './tabs/Shop';
import Withdraw from './tabs/Withdraw';
import Profile from './tabs/Profile';

const tabs = [
  { id: 'home', label: 'Tap', icon: Home, component: TapToEarn },
  { id: 'referral', label: 'Referral', icon: Users, component: Referral },
  { id: 'shop', label: 'VIP Shop', icon: ShoppingBag, component: Shop },
  { id: 'withdraw', label: 'Withdraw', icon: CreditCard, component: Withdraw },
  { id: 'profile', label: 'Profile', icon: User, component: Profile },
];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const { user, loading } = useUser();
  const { isReady } = useTelegram();

  if (loading || !isReady) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to TapX!</h2>
          <p className="text-gray-300">Please open this app through Telegram</p>
        </div>
      </div>
    );
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TapToEarn;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ActiveComponent user={user} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <motion.nav 
        className="glass border-t border-white/10 p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  isActive 
                    ? 'text-yellow-400 bg-white/10' 
                    : 'text-gray-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 bg-yellow-400 rounded-full mt-1"
                    layoutId="activeTab"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>
    </div>
  );
}