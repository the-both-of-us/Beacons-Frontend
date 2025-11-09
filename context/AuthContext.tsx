'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import type { Session } from 'next-auth';
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { loginWithRedirect, logoutWithRedirect, isAuthConfigured } from '@/lib/authClient';
import { api } from '@/lib/api';

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
  const account = session?.user || null;
  const sessionRole = (account?.role as Role | undefined) ?? 'user';
  const [role, setRole] = useState<Role>(sessionRole);
  const [adminStatusLoading, setAdminStatusLoading] = useState(false);

  useEffect(() => {
    setRole(sessionRole);
  }, [sessionRole]);

  useEffect(() => {
    let isMounted = true;

    const verifyAdminStatus = async () => {
      if (!account?.email) {
        setRole('user');
        return;
      }

      setAdminStatusLoading(true);
      try {
        const status = await api.getCurrentAdminStatus();
        if (isMounted && typeof status?.isAdmin === 'boolean') {
          setRole(status.isAdmin ? 'admin' : 'user');
        }
      } catch (err) {
        console.error('Failed to verify admin status', err);
      } finally {
        if (isMounted) {
          setAdminStatusLoading(false);
        }
      }
    };

    if (status === 'authenticated') {
      verifyAdminStatus();
    } else if (status === 'unauthenticated') {
      setRole('user');
    }

    return () => {
      isMounted = false;
    };
  }, [status, account?.email]);

  const loading = status === 'loading' || adminStatusLoading;

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
