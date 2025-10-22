# TapX - Telegram Mini App

A comprehensive Telegram Mini App for earning money through tapping, featuring VIP tiers, referral systems, and UPI withdrawals.

## 🚀 Features

### User Features
- **Tap to Earn**: Earn ₹0.002 per tap with VIP multipliers
- **VIP Tiers**: Free (1x), VIP 1 (2x), VIP 2 (2.5x) multipliers
- **Referral System**: Earn ₹1 per successful referral
- **UPI Withdrawals**: Direct withdrawals to UPI accounts
- **Real-time Animations**: Smooth Framer Motion animations
- **Responsive Design**: Optimized for mobile devices

### Admin Features
- **Dashboard Statistics**: Real-time user and revenue analytics
- **Settings Management**: Configure tap values, multipliers, and limits
- **Withdrawal Approvals**: Review and process withdrawal requests

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Animations**: Framer Motion
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Notifications**: React Hot Toast
- **Integration**: Telegram WebApp SDK

## 📱 VIP Tiers

| Tier | Price | Multiplier | Daily Limit | Withdrawals/Day | Min Withdrawal |
|------|-------|------------|-------------|-----------------|----------------|
| Free | N/A | 1.0x | 1,000 | 1 | ₹200 |
| VIP 1 | 75 Stars | 2.0x | 5,000 | 3 | ₹250 |
| VIP 2 | 150 Stars | 2.5x | 10,000 | 5 | ₹500 |

## 🔧 Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Enable Authentication (optional, for admin features)
4. Get your Firebase configuration

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Admin Configuration
ADMIN_SECRET_KEY=tapx-admin-2024
```

### 3. Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### 4. Telegram Bot Setup

1. Create a new bot with [@BotFather](https://t.me/BotFather)
2. Set up the Mini App URL in bot settings
3. Configure the bot commands and description

## 🌐 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Deploy
firebase deploy
```

## 📊 Admin Access

Access the admin dashboard by adding URL parameters:
```
https://your-app.vercel.app/?admin=true&key=tapx-admin-2024
```

## 🔒 Security Features

- Environment-based configuration
- Admin access control via URL parameters
- Input validation for UPI IDs and amounts
- Rate limiting for tap actions
- Secure Firebase rules (configure in Firebase Console)

## 📱 Telegram Integration

The app automatically detects:
- User information from Telegram
- Referral parameters from deep links
- Theme preferences (light/dark mode)
- Haptic feedback support

## 🎨 Animations

- **Tap Button**: Bounce and glow effects
- **Coin Particles**: Flying coin animations on tap
- **VIP Badges**: Rotating gradient borders
- **Page Transitions**: Smooth slide animations
- **Loading States**: Spinner and skeleton loaders

## 🔄 Auto-Features

- **Daily Reset**: Tap counts reset at midnight
- **VIP Expiry**: Automatic downgrade after 30 days
- **Real-time Updates**: Live balance and stats updates
- **Responsive Design**: Adapts to all screen sizes

## 📈 Analytics

The admin dashboard provides:
- Total users and active VIPs
- Revenue generation metrics
- Withdrawal processing stats
- User engagement analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

---

**Note**: This is a demonstration app. Ensure compliance with local regulations before deploying for real money transactions.