'use client';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { AuthStatus } from '@/components/auth/AuthStatus';

export default function LoginPage() {
  const { account, login, logout, loading } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="mx-auto max-w-2xl py-12 space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Beacons</h1>
          <p className="text-gray-600">Sign in with your Google account to turn strangers into neighbors. Chat, vote, and connect with your community.</p>
        </div>

        <AuthStatus />

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={login} disabled={loading}>
              {account ? 'Switch Account' : 'Sign In'}
            </Button>
            {account && (
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            After signing in, return to{' '}
            <a href="/scan" className="text-blue-600 underline">
              /scan
            </a>{' '}
            to join a room.
          </p>
        </div>
      </div>
    </main>
  );
}
