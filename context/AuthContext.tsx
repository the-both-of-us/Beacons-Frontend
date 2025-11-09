'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { createContext, useContext, ReactNode } from 'react';
import { loginWithRedirect, logoutWithRedirect, isAuthConfigured } from '@/lib/authClient';

type SessionUser = Session['user'] | null;
type Role = 'admin' | 'user';

interface AuthContextValue {
  user: SessionUser;
  account: SessionUser;
  role: Role;
  isAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const account = session?.user || null;
  const role = (account?.role as Role | undefined) ?? 'user';

  const value: AuthContextValue = {
    user: account,
    account,
    role,
    isAdmin: role === 'admin',
    loading,
    login: async () => {
      if (!isAuthConfigured) {
        alert('Authentication is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable sign-in.');
        return;
      }
      try {
        await loginWithRedirect();
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : 'Unable to start sign-in.');
      }
    },
    logout: async () => {
      if (!isAuthConfigured) {
        return;
      }
      try {
        await logoutWithRedirect();
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : 'Unable to sign out.');
      }
    },
    getToken: async () => {
      return session?.idToken ?? null;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <AuthContextProvider>{children}</AuthContextProvider>
    </SessionProvider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

// For backwards compatibility
export type { AuthContextValue };
