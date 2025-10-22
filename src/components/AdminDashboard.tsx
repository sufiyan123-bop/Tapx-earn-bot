'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Settings, CheckCircle, Shield } from 'lucide-react';
import AdminStats from './admin/AdminStats';
import AdminSettings from './admin/AdminSettings';
import AdminApprovals from './admin/AdminApprovals';

const tabs = [
  { id: 'stats', label: 'Statistics', icon: BarChart3, component: AdminStats },
  { id: 'settings', label: 'Settings', icon: Settings, component: AdminSettings },
  { id: 'approvals', label: 'Approvals', icon: CheckCircle, component: AdminApprovals },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || AdminStats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Admin Header */}
      <motion.div
        className="glass border-b border-red-500/20 p-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center">
            <Shield className="text-red-400 mr-3" size={24} />
            <div>
              <h1 className="text-xl font-bold text-red-400">Admin Dashboard</h1>
              <p className="text-gray-400 text-sm">TapX Management Panel</p>
            </div>
          </div>
          <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
            <span className="text-red-400 text-xs font-semibold">ADMIN MODE</span>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.nav
        className="glass border-b border-white/10 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex justify-center space-x-1 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={16} className="mr-2" />
                <span className="text-sm font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    className="w-1 h-1 bg-red-400 rounded-full ml-2"
                    layoutId="activeAdminTab"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}