'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface HaricanUser {
  id: string;
  username: string;
  display_name: string;
  full_name: string;
  email: string;
  role: 'harican_admin' | 'harican_user';
  brand: 'harican';
  created_at: string;
}

interface HaricanAuthContextType {
  user: HaricanUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const HaricanAuthContext = createContext<HaricanAuthContextType | undefined>(undefined);

export function HaricanAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<HaricanUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('harican_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored Harican user:', error);
          localStorage.removeItem('harican_user');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Hardcoded Harican credentials for now
      // You can later integrate with database authentication
      if (username === 'harican-admin' && password === 'harican123') {
        const testUser: HaricanUser = {
          id: 'harican-user-1',
          username: 'harican-admin',
          display_name: 'Harican Admin',
          full_name: 'Harican Administrator',
          email: 'admin@harican.com',
          role: 'harican_admin',
          brand: 'harican',
          created_at: new Date().toISOString()
        };
        
        setUser(testUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('harican_user', JSON.stringify(testUser));
        }
        return true;
      }

      // For regular Harican user
      if (username === 'harican-user' && password === 'harican456') {
        const regularUser: HaricanUser = {
          id: 'harican-user-2',
          username: 'harican-user',
          display_name: 'Harican User',
          full_name: 'Harican Staff',
          email: 'user@harican.com',
          role: 'harican_user',
          brand: 'harican',
          created_at: new Date().toISOString()
        };
        
        setUser(regularUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('harican_user', JSON.stringify(regularUser));
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('harican_user');
      window.location.href = '/harican-auth';
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return (
    <HaricanAuthContext.Provider value={value}>
      {children}
    </HaricanAuthContext.Provider>
  );
}

export function useHaricanAuth() {
  const context = useContext(HaricanAuthContext);
  if (context === undefined) {
    throw new Error('useHaricanAuth must be used within a HaricanAuthProvider');
  }
  return context;
}