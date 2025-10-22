'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { isAdmin } from '@/lib/utils';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import LoadingScreen from '@/components/LoadingScreen';

function AppContent() {
  const searchParams = useSearchParams();
  const showAdmin = isAdmin(searchParams);

  if (showAdmin) {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AppContent />
    </Suspense>
  );
}