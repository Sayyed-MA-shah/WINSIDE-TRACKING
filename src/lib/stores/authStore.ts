import { User, AuthState } from '../types/auth';

import { generateId } from '../utils/ssr-safe';

// Initialize with only admin user - real users will be stored in localStorage
const getStoredUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('winside-users');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getPendingUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem('winside-pending-users');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: User[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('winside-users', JSON.stringify(users));
  }
};

const savePendingUsers = (users: User[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('winside-pending-users', JSON.stringify(users));
  }
};

// Only include admin user by default
const defaultUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@admin.com',
    name: 'WINSIDE Admin',
    role: 'admin',
    status: 'approved',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  }
];

let mockUsers: User[] = [];
let mockPendingUsers: User[] = [];

class AuthStore {
  private state: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false
  };
  
  private listeners: Array<() => void> = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  private setState(updates: Partial<AuthState>) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  getState() {
    return this.state;
  }

  async login(email: string, password: string): Promise<{ success: boolean; message?: string; requiresApproval?: boolean }> {
    this.setState({ isLoading: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user in mock database
    const user = mockUsers.find(u => u.email === email && u.status === 'approved');
    
    if (!user) {
      // Check if user exists but is pending
      const pendingUser = mockPendingUsers.find(u => u.email === email);
      if (pendingUser) {
        this.setState({ isLoading: false });
        return { 
          success: false, 
          message: 'Your account is pending approval from an administrator.',
          requiresApproval: true 
        };
      }
      
      this.setState({ isLoading: false });
      return { success: false, message: 'Invalid credentials or account not found.' };
    }

    // In a real app, you'd verify the password hash here
    // For demo purposes, accept any password for approved users (except admin which has specific password)
    if (email === 'admin@admin.com' && password !== 'admin123') {
      this.setState({ isLoading: false });
      return { success: false, message: 'Invalid credentials.' };
    } else if (email !== 'admin@admin.com' && password.length < 3) {
      this.setState({ isLoading: false });
      return { success: false, message: 'Password must be at least 3 characters.' };
    }

    // Update last login
    user.lastLogin = new Date();
    
    this.setState({ 
      user, 
      isAuthenticated: true, 
      isLoading: false 
    });
    
    // Store in localStorage
    localStorage.setItem('auth-user', JSON.stringify(user));
    
    return { success: true };
  }

  logout() {
    this.setState({ 
      user: null, 
      isAuthenticated: false, 
      isLoading: false 
    });
    localStorage.removeItem('auth-user');
  }

  async register(email: string, password: string, name: string): Promise<{ success: boolean; message?: string; requiresApproval?: boolean }> {
    this.setState({ isLoading: true });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = [...mockUsers, ...mockPendingUsers].find(u => u.email === email);
    if (existingUser) {
      this.setState({ isLoading: false });
      return { success: false, message: 'User with this email already exists.' };
    }

    // Create new pending user
    const newUser: User = {
      id: generateId('user'),
      email,
      name,
      role: 'user',
      status: 'pending',
      createdAt: new Date()
    };

    mockPendingUsers.push(newUser);
    savePendingUsers(mockPendingUsers);
    
    this.setState({ isLoading: false });
    return { 
      success: true, 
      message: 'Registration successful! Your account is pending admin approval.',
      requiresApproval: true 
    };
  }

  getPendingUsers(): User[] {
    return mockPendingUsers.filter(u => u.status === 'pending');
  }

  approveUser(userId: string) {
    const userIndex = mockPendingUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      const user = mockPendingUsers[userIndex];
      user.status = 'approved';
      mockUsers.push(user);
      mockPendingUsers.splice(userIndex, 1);
      saveUsers(mockUsers);
      savePendingUsers(mockPendingUsers);
      this.notify();
    }
  }

  rejectUser(userId: string) {
    const userIndex = mockPendingUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockPendingUsers[userIndex].status = 'rejected';
      savePendingUsers(mockPendingUsers);
      this.notify();
    }
  }

  deleteUser(userId: string) {
    // Remove from approved users
    const approvedIndex = mockUsers.findIndex(u => u.id === userId);
    if (approvedIndex !== -1) {
      mockUsers.splice(approvedIndex, 1);
      saveUsers(mockUsers);
      this.notify();
      return;
    }
    
    // Remove from pending users
    const pendingIndex = mockPendingUsers.findIndex(u => u.id === userId);
    if (pendingIndex !== -1) {
      mockPendingUsers.splice(pendingIndex, 1);
      savePendingUsers(mockPendingUsers);
      this.notify();
    }
  }

  getAllUsers(): User[] {
    return [...mockUsers, ...mockPendingUsers];
  }

  // Clear all demo data and reset to admin only
  clearAllData() {
    mockUsers = [...defaultUsers];
    mockPendingUsers = [];
    saveUsers(mockUsers);
    savePendingUsers(mockPendingUsers);
    
    // Clear current session if not admin
    if (this.state.user && this.state.user.role !== 'admin') {
      this.logout();
    }
    
    this.notify();
  }

  checkPermission(requiredRole?: 'admin' | 'user'): boolean {
    const { user, isAuthenticated } = this.state;
    
    if (!isAuthenticated || !user) return false;
    if (user.status !== 'approved') return false;
    if (!requiredRole) return true;
    
    if (requiredRole === 'admin') {
      return user.role === 'admin';
    }
    
    return true; // 'user' role can access user-level features
  }

  // Initialize from localStorage
  init() {
    try {
      // Load users from localStorage or use defaults
      const storedUsers = getStoredUsers();
      const storedPendingUsers = getPendingUsers();
      
      // Initialize with stored data or defaults
      mockUsers = storedUsers.length > 0 ? storedUsers : [...defaultUsers];
      mockPendingUsers = storedPendingUsers;
      
      // Save defaults if no stored users exist
      if (storedUsers.length === 0) {
        saveUsers(mockUsers);
      }
      
      // Check for authenticated user session
      const storedUser = localStorage.getItem('auth-user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Verify user still exists and is approved
        const validUser = mockUsers.find(u => u.id === user.id && u.status === 'approved');
        if (validUser) {
          this.setState({ user: validUser, isAuthenticated: true });
        } else {
          localStorage.removeItem('auth-user');
        }
      }
    } catch (error) {
      // If there's an error, reset to defaults
      mockUsers = [...defaultUsers];
      mockPendingUsers = [];
      saveUsers(mockUsers);
      savePendingUsers(mockPendingUsers);
      localStorage.removeItem('auth-user');
    }
  }
}

export const authStore = new AuthStore();
