'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoomManager } from '@/components/admin/RoomManager';
import { AdminManager } from '@/components/admin/AdminManager';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

type Tab = 'rooms' | 'admins';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('rooms');
  const { account, loading, login, isAdmin } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 flex items-center justify-center">
        <p className="text-gray-600">Checking authentication…</p>
      </main>
    );
  }

  if (!account) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 flex items-center justify-center">
        <div className="rounded-2xl border border-blue-200 bg-white px-6 py-8 text-center max-w-md space-y-4 shadow">
          <h1 className="text-2xl font-bold text-gray-900">🔦 Beacons Admin</h1>
          <p className="text-gray-600">
            Sign in with your Google account to manage locations, QR codes, and admin team.
          </p>
          <Button onClick={login} className="w-full">
            Sign in with Google
          </Button>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 flex items-center justify-center">
        <div className="rounded-2xl border border-amber-200 bg-white px-6 py-8 text-center max-w-md space-y-4 shadow">
          <h1 className="text-2xl font-bold text-gray-900">Insufficient permissions</h1>
          <p className="text-gray-600">
            You're signed in, but your account doesn't have admin privileges. Ask an existing admin to add your email through the admin dashboard.
          </p>
          <Button onClick={login} variant="outline" className="w-full">
            Switch Account
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4">
      <div className="container mx-auto max-w-6xl py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage rooms with auto-generated QR codes and admin users</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'rooms'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Rooms
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'admins'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage Admins
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'rooms' && <RoomManager />}
          {activeTab === 'admins' && <AdminManager />}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
