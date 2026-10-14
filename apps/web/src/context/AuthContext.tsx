'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IUser, IAddress } from '@sai-punjabi/shared';
import { api } from '../lib/api';

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  addAddress: (address: IAddress) => Promise<void>;
  deleteAddress: (addressId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await api.get<{ user: IUser }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post<{ user: IUser; token: string }>('/auth/login', {
      email,
      password,
    });
    if (data.token) {
      localStorage.setItem('sai_punjabi_token', data.token);
    }
    setUser(data.user);
  };

  const signup = async (formData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const data = await api.post<{ user: IUser; token: string }>('/auth/signup', formData);
    if (data.token) {
      localStorage.setItem('sai_punjabi_token', data.token);
    }
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('sai_punjabi_token');
      setUser(null);
    }
  };

  const addAddress = async (address: IAddress) => {
    const res = await api.post<{ addresses: IAddress[] }>('/auth/address', address);
    if (user) {
      setUser({ ...user, addresses: res.addresses });
    }
  };

  const deleteAddress = async (addressId: string) => {
    const res = await api.delete<{ addresses: IAddress[] }>(`/auth/address/${addressId}`);
    if (user) {
      setUser({ ...user, addresses: res.addresses });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        refreshUser,
        addAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
