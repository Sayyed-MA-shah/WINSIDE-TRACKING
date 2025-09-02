import { useState, useEffect } from 'react';
import { authStore } from '../stores/authStore';
import { AuthState } from '../types/auth';

export function useAuth() {
  const [state, setState] = useState<AuthState>(authStore.getState());

  useEffect(() => {
    // Initialize auth store
    authStore.init();
    
    // Subscribe to changes
    const unsubscribe = authStore.subscribe(() => {
      setState(authStore.getState());
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    login: authStore.login.bind(authStore),
    logout: authStore.logout.bind(authStore),
    register: authStore.register.bind(authStore),
    getPendingUsers: authStore.getPendingUsers.bind(authStore),
    approveUser: authStore.approveUser.bind(authStore),
    rejectUser: authStore.rejectUser.bind(authStore),
    deleteUser: authStore.deleteUser.bind(authStore),
    getAllUsers: authStore.getAllUsers.bind(authStore),
    clearAllData: authStore.clearAllData.bind(authStore),
    checkPermission: authStore.checkPermission.bind(authStore),
  };
}
