'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X, Clock, Users, UserCheck, AlertCircle, Trash2 } from 'lucide-react';
import ClientOnly from '@/components/ClientOnly';

// Safe date formatter that works on both server and client
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return 'Never';
  
  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  // Use a consistent format that works on both server and client
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${month}/${day}/${year}`;
};

function UserManagementContent() {
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  
  // State for users to prevent hydration mismatch
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authMethods, setAuthMethods] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Safely load auth methods after component mounts
  useEffect(() => {
    const loadAuth = async () => {
      try {
        setLoadError(null);
        const { useAuth } = await import('@/lib/hooks/useAuth');
        const { authStore } = await import('@/lib/stores/authStore');
        
        // Get methods from auth store directly
        setAuthMethods({
          getPendingUsers: () => authStore.getPendingUsers(),
          getAllUsers: () => authStore.getAllUsers(),
          approveUser: (id: string) => authStore.approveUser(id),
          rejectUser: (id: string) => authStore.rejectUser(id),
          deleteUser: (id: string) => authStore.deleteUser(id),
          clearAllData: () => authStore.clearAllData()
        });
        
        // Load initial data
        setPendingUsers(authStore.getPendingUsers());
        setAllUsers(authStore.getAllUsers());
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading auth:', error);
        setLoadError(`Auth loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoaded(true); // Still set loaded to prevent infinite loading
      }
    };
    
    loadAuth();
  }, []);

  const approvedUsers = allUsers.filter(u => u.status === 'approved');

  const handleApprove = (userId: string) => {
    try {
      if (!authMethods) {
        setAlert({
          type: 'error',
          message: 'Authentication system not loaded. Please refresh the page.'
        });
        return;
      }
      authMethods.approveUser(userId);
      // Refresh the users lists
      setPendingUsers(authMethods.getPendingUsers());
      setAllUsers(authMethods.getAllUsers());
      setAlert({
        type: 'success',
        message: 'User has been approved and can now access the dashboard.'
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Failed to approve user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    setTimeout(() => setAlert(null), 5000);
  };

  const handleReject = (userId: string) => {
    try {
      if (!authMethods) {
        setAlert({
          type: 'error',
          message: 'Authentication system not loaded. Please refresh the page.'
        });
        return;
      }
      authMethods.rejectUser(userId);
      // Refresh the users lists
      setPendingUsers(authMethods.getPendingUsers());
      setAllUsers(authMethods.getAllUsers());
      setAlert({
        type: 'info',
        message: 'User access has been rejected.'
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Failed to reject user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    setTimeout(() => setAlert(null), 5000);
  };

  const handleDelete = (userId: string, userName: string) => {
    try {
      if (!authMethods) {
        setAlert({
          type: 'error',
          message: 'Authentication system not loaded. Please refresh the page.'
        });
        return;
      }
      if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
        authMethods.deleteUser(userId);
        // Refresh the users lists
        setPendingUsers(authMethods.getPendingUsers());
        setAllUsers(authMethods.getAllUsers());
        setAlert({
          type: 'info',
          message: 'User has been deleted successfully.'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    setTimeout(() => setAlert(null), 5000);
  };

  const handleClearDemoData = () => {
    try {
      if (!authMethods) {
        setAlert({
          type: 'error',
          message: 'Authentication system not loaded. Please refresh the page.'
        });
        return;
      }
      if (confirm('Are you sure you want to clear all demo data? This will remove all users except the admin account. This action cannot be undone.')) {
        authMethods.clearAllData();
        // Refresh the users lists
        setPendingUsers(authMethods.getPendingUsers());
        setAllUsers(authMethods.getAllUsers());
        setAlert({
          type: 'success',
          message: 'All demo data has been cleared. Only the admin account remains.'
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: `Failed to clear demo data: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    setTimeout(() => setAlert(null), 5000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'user':
        return <Badge variant="outline">User</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <AuthGuard requireAdmin>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage user access and permissions for the dashboard.</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleClearDemoData}
              className="w-fit"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Demo Data
            </Button>
          </div>

          {alert && (
            <Alert className={`${
              alert.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' :
              alert.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' :
              'border-blue-200 bg-blue-50 text-blue-800'
            }`}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          {/* Load Error Display */}
          {loadError && (
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>System Error:</strong> {loadError}
                <br />
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Reload Page
                </button>
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          {!isLoaded ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading user data...</div>
            </div>
          ) : (
            <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-200">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">{allUsers.length}</div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-200">Approved Users</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approvedUsers.length}</div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-200">Pending Approval</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Users */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Pending Approval</CardTitle>
              <CardDescription>
                Users waiting for admin approval to access the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400">No pending users</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="dark:border-gray-700">
                        <TableHead className="dark:text-gray-300">Name</TableHead>
                        <TableHead className="dark:text-gray-300">Email</TableHead>
                        <TableHead className="dark:text-gray-300">Requested</TableHead>
                        <TableHead className="dark:text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((user) => (
                        <TableRow key={user.id} className="dark:border-gray-700">
                          <TableCell className="font-medium dark:text-white">{user.name}</TableCell>
                          <TableCell className="dark:text-gray-300">{user.email}</TableCell>
                          <TableCell className="dark:text-gray-300">
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(user.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(user.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Users */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">All Users</CardTitle>
              <CardDescription>
                Complete list of all users and their current status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead className="dark:text-gray-300">Name</TableHead>
                      <TableHead className="dark:text-gray-300">Email</TableHead>
                      <TableHead className="dark:text-gray-300">Role</TableHead>
                      <TableHead className="dark:text-gray-300">Status</TableHead>
                      <TableHead className="dark:text-gray-300">Last Login</TableHead>
                      <TableHead className="dark:text-gray-300">Joined</TableHead>
                      <TableHead className="dark:text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allUsers.map((user) => (
                      <TableRow key={user.id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-white">{user.name}</TableCell>
                        <TableCell className="dark:text-gray-300">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="dark:text-gray-300">
                          {formatDate(user.lastLogin)}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          {user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(user.id, user.name)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
            </>
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

export default function UserManagementPage() {
  return (
    <ClientOnly>
      <UserManagementContent />
    </ClientOnly>
  );
}
