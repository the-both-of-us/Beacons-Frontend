'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { createContext, useContext, ReactNode } from 'react';
import { loginWithRedirect, logoutWithRedirect, isAuthConfigured } from '@/lib/authClient';

interface AuthContextValue {
  user: any | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  const value: AuthContextValue = {
    user: session?.user || null,
    loading,
    login: async () => {
      if (!isAuthConfigured) {
        alert('Authentication is not configured. Set GOOGLE_CLIENT_ID to enable sign-in.');
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
      // With Google OAuth, we don't need tokens for the backend since it's mostly public
      return null;
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
