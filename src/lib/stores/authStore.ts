import { User, AuthState } from '../types/auth';

import { generateId } from '../utils/ssr-safe';

// Simple user interface
const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@admin.com',
    name: 'Admin User',
    role: 'admin',
    status: 'approved',
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date()
  },
  {
    id: 'user-1',
    email: 'jane.smith@company.com',
    name: 'Jane Smith',
    role: 'user',
    status: 'approved',
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date('2024-01-20'),
  },
  {
    id: 'user-2',
    email: 'bob.brown@company.com',
    name: 'Bob Brown',
    role: 'user',
    status: 'approved',
    createdAt: new Date('2024-01-12'),
    lastLogin: new Date('2024-01-18'),
  }
];

// Mock pending users
const mockPendingUsers: User[] = [
  {
    id: 'pending-1',
    email: 'john.doe@company.com',
    name: 'John Doe',
    role: 'user',
    status: 'pending',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'pending-2',
    email: 'sarah.wilson@company.com',
    name: 'Sarah Wilson',
    role: 'user',
    status: 'pending',
    createdAt: new Date('2024-01-16'),
  },
  {
    id: 'pending-3',
    email: 'mike.johnson@company.com',
    name: 'Mike Johnson',
    role: 'user',
    status: 'pending',
    createdAt: new Date('2024-01-17'),
  }
];

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
      this.notify();
    }
  }

  rejectUser(userId: string) {
    const userIndex = mockPendingUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockPendingUsers[userIndex].status = 'rejected';
      this.notify();
    }
  }

  deleteUser(userId: string) {
    // Remove from approved users
    const approvedIndex = mockUsers.findIndex(u => u.id === userId);
    if (approvedIndex !== -1) {
      mockUsers.splice(approvedIndex, 1);
      this.notify();
      return;
    }
    
    // Remove from pending users
    const pendingIndex = mockPendingUsers.findIndex(u => u.id === userId);
    if (pendingIndex !== -1) {
      mockPendingUsers.splice(pendingIndex, 1);
      this.notify();
    }
  }

  getAllUsers(): User[] {
    return [...mockUsers, ...mockPendingUsers];
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
      localStorage.removeItem('auth-user');
    }
  }
}

export const authStore = new AuthStore();
