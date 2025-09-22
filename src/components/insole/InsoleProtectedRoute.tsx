'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInsoleAuth } from '@/lib/context/insole-auth';

interface InsoleProtectedRouteProps {
  children: React.ReactNode;
}

export function InsoleProtectedRoute({ children }: InsoleProtectedRouteProps) {
  const { user, isLoading } = useInsoleAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}