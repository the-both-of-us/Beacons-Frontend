'use client';

import { AccountInfo } from '@azure/msal-browser';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import {
  getAccessToken,
  initializeAuth,
  loginWithRedirect,
  logoutWithRedirect,
  isAuthConfigured,
} from '@/lib/authClient';

interface AuthContextValue {
  account: AccountInfo | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const activeAccount = await initializeAuth();
      if (!cancelled) {
        setAccount(activeAccount);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      loading,
      login: async () => {
        if (!isAuthConfigured) {
          alert('Authentication is not configured. Set NEXT_PUBLIC_AZURE_AD_CLIENT_ID to enable sign-in.');
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
      getToken: () => getAccessToken(),
    }),
    [account, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
