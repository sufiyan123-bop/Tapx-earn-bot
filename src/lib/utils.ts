export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function isAdmin(searchParams: URLSearchParams): boolean {
  const admin = searchParams.get('admin');
  const key = searchParams.get('key');
  return admin === 'true' && key === 'tapx-admin-2024';
}

export function generateReferralLink(userId: string): string {
  return `https://t.me/TapX_EarnBot?start=${userId}`;
}

export function isVipExpired(vipExpiry?: Date): boolean {
  if (!vipExpiry) return true;
  return new Date() > vipExpiry;
}

export function getDaysUntilExpiry(vipExpiry?: Date): number {
  if (!vipExpiry) return 0;
  const now = new Date();
  const expiry = new Date(vipExpiry);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function validateUPI(upiId: string): boolean {
  // Basic UPI ID validation
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upiId);
}