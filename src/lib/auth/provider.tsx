'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  accessToken: string;
  refreshToken: string;
}

type AuthContextType = {
  token: UserInfo | null;
  isLoggedIn: boolean;
  setLoggedIn: (status: boolean) => void;
  setToken: (token: UserInfo | null) => void;
  logout: () => Promise<void>;
};

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setLoggedIn] = useState(false);
  const [token, setToken] = useState<UserInfo | null>(null);
  const router = useRouter();

  const logout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('interestIds');

    setToken(null);
    setLoggedIn(false);

    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider
      value={{ token, setToken, isLoggedIn, setLoggedIn, logout }}
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
