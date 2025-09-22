'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Save,
  Heart,
  User,
  Lock,
  Users,
  Plus,
  Edit,
  Trash2,
  Settings,
  Shield
} from 'lucide-react';
import { useInsoleAuth } from '@/lib/context/insole-auth';
import { getInsoleUsers, addInsoleUser, updateInsoleUser } from '@/lib/db/insole-db';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ThemeProvider } from '@/lib/context/theme-context';

interface InsoleUser {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  role: string;
  active: boolean;
  created_at: string;
}

export default function InsoleSettings() {
  const router = useRouter();
  const { user, updateUser } = useInsoleAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<InsoleUser[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<InsoleUser | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    username: '',
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    full_name: '',
    email: '',
    password: '',
    role: 'user'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user) {
      router.push('/dashboard');
      return;
    }

    // Initialize profile form with current user data
    setProfileForm(prev => ({
      ...prev,
      username: user.username || '',
      full_name: user.display_name || user.full_name || '',
      email: user.email || ''
    }));

    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [user, router, activeTab]);

  const fetchUsers = async () => {
    try {
      const usersData = await getInsoleUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfileForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!profileForm.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!profileForm.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (profileForm.new_password) {
      if (profileForm.new_password.length < 6) {
        newErrors.new_password = 'Password must be at least 6 characters';
      }
      if (profileForm.new_password !== profileForm.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewUserForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newUserForm.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!newUserForm.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!newUserForm.password) {
      newErrors.password = 'Password is required';
    } else if (newUserForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;

    try {
      setLoading(true);
      
      // In a real implementation, you would hash the password and update via API
      // For now, we'll simulate this
      console.log('Updating profile:', profileForm);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local user state
      updateUser({
        ...user!,
        username: profileForm.username,
        full_name: profileForm.full_name,
        email: profileForm.email
      });

      alert('Profile updated successfully!');
      
      // Clear password fields
      setProfileForm(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateNewUserForm()) return;

    try {
      setLoading(true);
      
      // In a real implementation, hash the password
      const userData = {
        username: newUserForm.username,
        password_hash: `hashed_${newUserForm.password}`, // Simulate hashed password
        full_name: newUserForm.full_name,
        email: newUserForm.email,
        role: newUserForm.role,
        active: true
      };

      await addInsoleUser(userData);
      await fetchUsers();
      
      setShowAddUser(false);
      setNewUserForm({
        username: '',
        full_name: '',
        email: '',
        password: '',
        role: 'user'
      });
      
      alert('User added successfully!');
      
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user. Please check if username already exists.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/insole')}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Back to Dashboard</span>
              </Button>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-red-500 text-red-600 dark:text-red-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username *</Label>
                        <Input
                          id="username"
                          name="username"
                          value={profileForm.username}
                          onChange={handleProfileChange}
                          className={errors.username ? 'border-red-500' : ''}
                        />
                        {errors.username && (
                          <p className="text-sm text-red-600">{errors.username}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={profileForm.full_name}
                          onChange={handleProfileChange}
                          className={errors.full_name ? 'border-red-500' : ''}
                        />
                        {errors.full_name && (
                          <p className="text-sm text-red-600">{errors.full_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Update Profile'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input
                        id="current_password"
                        name="current_password"
                        type="password"
                        value={profileForm.current_password}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new_password">New Password</Label>
                        <Input
                          id="new_password"
                          name="new_password"
                          type="password"
                          value={profileForm.new_password}
                          onChange={handleProfileChange}
                          className={errors.new_password ? 'border-red-500' : ''}
                        />
                        {errors.new_password && (
                          <p className="text-sm text-red-600">{errors.new_password}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm_password">Confirm New Password</Label>
                        <Input
                          id="confirm_password"
                          name="confirm_password"
                          type="password"
                          value={profileForm.confirm_password}
                          onChange={handleProfileChange}
                          className={errors.confirm_password ? 'border-red-500' : ''}
                        />
                        {errors.confirm_password && (
                          <p className="text-sm text-red-600">{errors.confirm_password}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={loading}>
                        <Lock className="h-4 w-4 mr-2" />
                        {loading ? 'Updating...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      User Management
                    </CardTitle>
                    <Button onClick={() => setShowAddUser(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">No users found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Users will appear here once the database tables are created
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium">{u.full_name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">@{u.username}</p>
                              {u.email && (
                                <p className="text-sm text-gray-500">{u.email}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={u.active ? 'default' : 'secondary'}>
                              {u.active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">{u.role}</Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Add User Form */}
              {showAddUser && (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddUser} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new_username">Username *</Label>
                          <Input
                            id="new_username"
                            name="username"
                            value={newUserForm.username}
                            onChange={handleNewUserChange}
                            className={errors.username ? 'border-red-500' : ''}
                          />
                          {errors.username && (
                            <p className="text-sm text-red-600">{errors.username}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new_full_name">Full Name *</Label>
                          <Input
                            id="new_full_name"
                            name="full_name"
                            value={newUserForm.full_name}
                            onChange={handleNewUserChange}
                            className={errors.full_name ? 'border-red-500' : ''}
                          />
                          {errors.full_name && (
                            <p className="text-sm text-red-600">{errors.full_name}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new_email">Email</Label>
                          <Input
                            id="new_email"
                            name="email"
                            type="email"
                            value={newUserForm.email}
                            onChange={handleNewUserChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="new_role">Role</Label>
                          <select
                            id="new_role"
                            name="role"
                            value={newUserForm.role}
                            onChange={handleNewUserChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new_password">Password *</Label>
                        <Input
                          id="new_password"
                          name="password"
                          type="password"
                          value={newUserForm.password}
                          onChange={handleNewUserChange}
                          className={errors.password ? 'border-red-500' : ''}
                        />
                        {errors.password && (
                          <p className="text-sm text-red-600">{errors.password}</p>
                        )}
                      </div>

                      <div className="flex gap-3 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddUser(false)}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          <Plus className="h-4 w-4 mr-2" />
                          {loading ? 'Adding...' : 'Add User'}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
                        Current User Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-400">Username:</span>
                          <span className="font-medium">{user.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-400">Role:</span>
                          <Badge variant="outline">{user.role || 'User'}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-400">Last Login:</span>
                          <span className="font-medium">Current Session</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">
                        Security Recommendations
                      </h4>
                      <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-300">
                        <li>• Use a strong password with at least 8 characters</li>
                        <li>• Include uppercase, lowercase, numbers, and symbols</li>
                        <li>• Change your password regularly</li>
                        <li>• Don't share your login credentials</li>
                        <li>• Log out when using shared computers</li>
                      </ul>
                    </div>

                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-red-600 mt-1" />
                          <div>
                            <h4 className="font-medium text-red-800 dark:text-red-200">Database Security</h4>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                              The insole system uses secure authentication. For enhanced security, ensure proper database RLS policies are configured in Supabase.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
    </ThemeProvider>
  );
}