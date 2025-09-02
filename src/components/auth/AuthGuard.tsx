'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, user, checkPermission } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Small delay to allow auth store to initialize
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push('/auth');
        return;
      }

      if (requireAdmin && !checkPermission('admin')) {
        router.push('/dashboard'); // Redirect to dashboard if not admin
        return;
      }

      if (user?.status !== 'approved') {
        router.push('/auth');
        return;
      }

      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, requireAdmin, router, checkPermission]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
