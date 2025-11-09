'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { isAuthConfigured } from '@/lib/authClient';

export function AuthStatus() {
  const { account, loading, login, logout } = useAuth();

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
        Authentication isn’t configured. Set <code className="font-mono">NEXT_PUBLIC_AZURE_AD_CLIENT_ID</code> and related
        Azure AD variables to enable sign-in.
      </div>
    );
  }

  if (!account) {
    return (
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-blue-900">You’re not signed in</p>
          <p className="text-sm text-blue-700">
            Sign in with your Microsoft account to join rooms and manage QR codes.
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
        <p className="text-sm text-green-800">{account.username || account.name}</p>
      </div>
      <Button variant="outline" onClick={logout}>
        Sign out
      </Button>
    </div>
  );
}
