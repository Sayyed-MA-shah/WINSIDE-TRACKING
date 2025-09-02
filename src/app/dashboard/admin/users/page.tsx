'use client';

import { useState } from 'react';
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
import { useAuth } from '@/lib/hooks/useAuth';

export default function UserManagementPage() {
  const { getPendingUsers, approveUser, rejectUser, deleteUser, getAllUsers } = useAuth();
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const pendingUsers = getPendingUsers();
  const allUsers = getAllUsers();
  const approvedUsers = allUsers.filter(u => u.status === 'approved');

  const handleApprove = (userId: string) => {
    approveUser(userId);
    setAlert({
      type: 'success',
      message: 'User has been approved and can now access the dashboard.'
    });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleReject = (userId: string) => {
    rejectUser(userId);
    setAlert({
      type: 'info',
      message: 'User access has been rejected.'
    });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleDelete = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      deleteUser(userId);
      setAlert({
        type: 'info',
        message: 'User has been deleted successfully.'
      });
      setTimeout(() => setAlert(null), 5000);
    }
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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage user access and permissions for the dashboard.</p>
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

          {/* Stats Cards */}
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
                            {user.createdAt.toLocaleDateString()}
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
                          {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                          {user.createdAt.toLocaleDateString()}
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
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
