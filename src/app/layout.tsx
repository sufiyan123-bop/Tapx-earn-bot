import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TapX - Earn Money by Tapping',
  description: 'Telegram Mini App for earning money through tapping with VIP tiers and referral system',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  other: {
    'telegram-web-app': 'true',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <Script 
          src="/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  );
}