'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, DollarSign, Users, Crown, Save, RotateCcw } from 'lucide-react';
import { getSettings, updateSettings, AppSettings } from '@/lib/firestore';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleInputChange = (field: keyof AppSettings, value: string | number) => {
    if (!settings) return;
    
    setSettings(prev => ({
      ...prev!,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value,
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!settings || !hasChanges) return;

    setSaving(true);
    try {
      await updateSettings(settings);
      toast.success('Settings updated successfully!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
      setHasChanges(false);
      toast.success('Settings reset to current values');
    } catch (error) {
      toast.error('Failed to reset settings');
    } finally {
      setLoading(false);
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

  if (!settings) {
    return (
      <div className="text-center text-gray-400">
        <p>Failed to load settings</p>
      </div>
    );
  }

  const settingSections = [
    {
      title: 'Tap Configuration',
      icon: DollarSign,
      color: 'text-green-400',
      settings: [
        {
          key: 'baseTapValue' as keyof AppSettings,
          label: 'Base Tap Value (₹)',
          value: settings.baseTapValue,
          type: 'number',
          step: 0.001,
          min: 0.001,
          description: 'Amount earned per tap for free users',
        },
      ],
    },
    {
      title: 'Referral System',
      icon: Users,
      color: 'text-purple-400',
      settings: [
        {
          key: 'referralBonus' as keyof AppSettings,
          label: 'Referral Bonus (₹)',
          value: settings.referralBonus,
          type: 'number',
          step: 0.1,
          min: 0,
          description: 'Amount earned per successful referral',
        },
      ],
    },
    {
      title: 'VIP Configuration',
      icon: Crown,
      color: 'text-yellow-400',
      settings: [
        {
          key: 'vip1Multiplier' as keyof AppSettings,
          label: 'VIP 1 Multiplier',
          value: settings.vip1Multiplier,
          type: 'number',
          step: 0.1,
          min: 1,
          description: 'Tap multiplier for VIP 1 users',
        },
        {
          key: 'vip2Multiplier' as keyof AppSettings,
          label: 'VIP 2 Multiplier',
          value: settings.vip2Multiplier,
          type: 'number',
          step: 0.1,
          min: 1,
          description: 'Tap multiplier for VIP 2 users',
        },
        {
          key: 'vip1Limit' as keyof AppSettings,
          label: 'VIP 1 Daily Limit',
          value: settings.vip1Limit,
          type: 'number',
          step: 100,
          min: 1000,
          description: 'Daily tap limit for VIP 1 users',
        },
        {
          key: 'vip2Limit' as keyof AppSettings,
          label: 'VIP 2 Daily Limit',
          value: settings.vip2Limit,
          type: 'number',
          step: 100,
          min: 1000,
          description: 'Daily tap limit for VIP 2 users',
        },
      ],
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
        <h2 className="text-2xl font-bold text-white mb-2">System Settings</h2>
        <p className="text-gray-400">Configure TapX application parameters</p>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-8 mb-8">
        {settingSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              className="glass glow p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Icon className={section.color + ' mr-2'} size={20} />
                {section.title}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.settings.map((setting, settingIndex) => (
                  <motion.div
                    key={setting.key}
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + settingIndex * 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-300">
                      {setting.label}
                    </label>
                    <input
                      type={setting.type}
                      value={setting.value}
                      onChange={(e) => handleInputChange(setting.key, e.target.value)}
                      step={setting.step}
                      min={setting.min}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:border-red-500 focus:outline-none transition-colors text-white"
                    />
                    <p className="text-xs text-gray-400">{setting.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current Values Preview */}
      <motion.div
        className="glass glow p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
          <Settings className="text-blue-400 mr-2" size={20} />
          Current Earnings Preview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/30 p-4 rounded-lg">
            <p className="text-gray-300 text-sm">Free User (per tap)</p>
            <p className="text-green-400 font-bold text-lg">
              {formatCurrency(settings.baseTapValue)}
            </p>
          </div>
          <div className="bg-purple-500/10 p-4 rounded-lg">
            <p className="text-gray-300 text-sm">VIP 1 (per tap)</p>
            <p className="text-purple-400 font-bold text-lg">
              {formatCurrency(settings.baseTapValue * settings.vip1Multiplier)}
            </p>
          </div>
          <div className="bg-yellow-500/10 p-4 rounded-lg">
            <p className="text-gray-300 text-sm">VIP 2 (per tap)</p>
            <p className="text-yellow-400 font-bold text-lg">
              {formatCurrency(settings.baseTapValue * settings.vip2Multiplier)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex justify-end space-x-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          onClick={handleReset}
          disabled={loading}
          className="px-6 py-3 bg-gray-600/50 hover:bg-gray-600/70 text-gray-300 font-semibold rounded-lg transition-all disabled:opacity-50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center">
            <RotateCcw className="mr-2" size={18} />
            Reset
          </div>
        </motion.button>

        <motion.button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={hasChanges && !saving ? { scale: 1.02 } : {}}
          whileTap={hasChanges && !saving ? { scale: 0.98 } : {}}
        >
          <div className="flex items-center">
            <Save className="mr-2" size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </div>
        </motion.button>
      </motion.div>

      {hasChanges && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-yellow-400 text-sm">⚠️ You have unsaved changes</p>
        </motion.div>
      )}
    </div>
  );
}