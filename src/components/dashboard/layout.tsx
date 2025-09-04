'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  FileText,
  Menu,
  X,
  LogOut,
  Shield,
  User,
  Database
} from 'lucide-react';

interface SidebarProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Articles',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    name: 'Stock',
    href: '/dashboard/stock',
    icon: Warehouse,
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    name: 'Invoices',
    href: '/dashboard/invoices',
    icon: FileText,
  },
];

export function DashboardLayout({ children }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, checkPermission } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  // Add admin navigation if user is admin
  const adminNavigation = checkPermission('admin') ? [
    {
      name: 'User Management',
      href: '/dashboard/admin/users',
      icon: Shield,
    },
    {
      name: 'Backup & Restore',
      href: '/dashboard/admin/backup',
      icon: Database,
    }
  ] : [];

  const allNavigation = [...navigation, ...adminNavigation];

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        {/* Mobile sidebar overlay - only show on mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" />
          </div>
        )}

        {/* Sidebar */}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200 dark:border-gray-700',
            'transition-transform duration-300 ease-in-out lg:transition-none',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">WINSIDE</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="mt-8 flex-1">
            <div className="px-4 space-y-2">
              {allNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => {
                      // Close mobile sidebar when navigation happens
                      if (sidebarOpen) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={cn(
                      'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group',
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile Section - Bottom of Sidebar */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 mt-auto">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">AskFor</h1>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {/* User Profile Dropdown for Mobile */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-950">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
