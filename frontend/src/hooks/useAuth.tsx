import React, { createContext, useContext, useState } from 'react';
import { api } from '../lib/api';
import { authStorage } from '../lib/auth-storage';
import type { User, AuthResponse } from '../types/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthResponse | null>(() => authStorage.get());

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      const data = response.data;
      authStorage.set(data);
      setAuth(data);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, nickname: string): Promise<void> => {
    try {
      await api.post('/auth/register', { email, password, nickname });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authStorage.clear();
    setAuth(null);
  };

  const value: AuthContextType = {
    user: auth?.user ?? null,
    token: auth?.token ?? null,
    isAuthenticated: !!auth?.token,
    isAdmin: auth?.user?.role === 'admin',
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
