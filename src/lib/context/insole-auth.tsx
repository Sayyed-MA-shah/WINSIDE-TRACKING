'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authenticateInsoleUser } from '../db/insole-db';

interface InsoleUser {
  id: string;
  username: string;
  display_name: string;
  full_name?: string;
  email?: string;
  role?: string;
  created_at: string;
}

interface InsoleAuthContextType {
  user: InsoleUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: InsoleUser) => void;
  isLoading: boolean;
}

const InsoleAuthContext = createContext<InsoleAuthContextType | undefined>(undefined);

export function InsoleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<InsoleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('insole_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Error parsing stored insole user:', error);
          localStorage.removeItem('insole_user');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // For development/demo purposes, include a hardcoded test user
      // This allows testing without database setup
      if (username === 'insole-admin' && password === 'insole123') {
        const testUser: InsoleUser = {
          id: 'test-insole-user-1',
          username: 'insole-admin',
          display_name: 'Insole Clinic Admin',
          full_name: 'Insole Clinic Administrator',
          email: 'admin@insoleclinic.com',
          role: 'admin',
          created_at: new Date().toISOString()
        };
        
        setUser(testUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('insole_user', JSON.stringify(testUser));
        }
        return true;
      }
      
      // Try to authenticate with the database
      const userData = await authenticateInsoleUser(username, password);
      
      if (userData) {
        setUser(userData);
        if (typeof window !== 'undefined') {
          localStorage.setItem('insole_user', JSON.stringify(userData));
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
      localStorage.removeItem('insole_user');
      window.location.href = '/';
    }
  };

  const updateUser = (userData: InsoleUser) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('insole_user', JSON.stringify(userData));
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    isLoading
  };

  return (
    <InsoleAuthContext.Provider value={value}>
      {children}
    </InsoleAuthContext.Provider>
  );
}

export function useInsoleAuth() {
  const context = useContext(InsoleAuthContext);
  if (context === undefined) {
    throw new Error('useInsoleAuth must be used within an InsoleAuthProvider');
  }
  return context;
}