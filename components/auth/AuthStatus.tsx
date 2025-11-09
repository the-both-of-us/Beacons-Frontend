'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { isAuthConfigured } from '@/lib/authClient';

interface AuthStatusProps {
  variant?: 'card' | 'header';
}

export function AuthStatus({ variant = 'card' }: AuthStatusProps) {
  const { account, loading, login, logout, isAdmin } = useAuth();

  if (variant === 'header') {
    if (loading) {
      return <div className="text-xs text-gray-500">Checking authentication…</div>;
    }

    if (!isAuthConfigured) {
      return null;
    }

    if (!account) {
      return (
        <Button size="sm" onClick={login}>
          Sign in
        </Button>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {account.username || account.name || account.email}
          </span>
          <span className="text-xs text-gray-500">Ready to chat</span>
        </div>
        {isAdmin && (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
            Admin
          </span>
        )}
        <Button variant="outline" size="sm" onClick={logout}>
          Sign out
        </Button>
      </div>
    );
  }

  // Card variant (default)
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
        Checking authentication…
      </div>
    );
  }

  if (!isAuthConfigured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
        Authentication isn’t configured. Set <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> (and restart the
        dev server) to enable Google sign-in with Auth.js.
      </div>
    );
  }

  if (!account) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-900">You’re not signed in</p>
          <p className="text-sm text-blue-700">
            Sign in with your Google account to join rooms and manage QR codes.
          </p>
        </div>
        <Button onClick={login}>Sign in</Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-green-900">Signed in as</p>
        <p className="text-sm text-green-800">{account.username || account.name || account.email}</p>
        {isAdmin && (
          <p className="text-xs uppercase tracking-wide text-green-700">Role: Admin</p>
        )}
      </div>
      <Button variant="outline" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}
