export interface User {
  userId: string;
  name: string;
  username?: string;
  balance: number;
  totalTaps: number;
  dailyTapCount: number;
  vipTier: 'free' | 'vip1' | 'vip2';
  vipExpiry?: Date;
  referrerId?: string;
  referralCount: number;
  referralEarnings: number;
  lastTapTime?: Date;
  createdAt: Date;
}

export interface VipTier {
  tier: 'free' | 'vip1' | 'vip2';
  price: number; // in Stars
  multiplier: number;
  dailyTapLimit: number;
  withdrawalLimit: number; // daily limit
  minWithdrawal: number; // minimum withdrawal amount in ₹
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  upiId: string;
  status: 'pending' | 'paid' | 'rejected';
  createdAt: Date;
  processedAt?: Date;
  adminNote?: string;
}

export interface AppSettings {
  baseTapValue: number; // ₹0.002
  referralBonus: number; // ₹1
  vip1Multiplier: number; // 2.0
  vip2Multiplier: number; // 2.5
  vip1Limit: number; // 5000
  vip2Limit: number; // 10000
  inrExchangeRate: number;
  secretKey: string;
}

export interface AdminStats {
  totalUsers: number;
  activeVips: number;
  totalInrGenerated: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    hint_color?: string;
    bg_color?: string;
    text_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}