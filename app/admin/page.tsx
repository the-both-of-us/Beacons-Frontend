'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoomManager } from '@/components/admin/RoomManager';
import { QRCodeManager } from '@/components/admin/QRCodeManager';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

type Tab = 'rooms' | 'qrcodes';

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
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 flex items-center justify-center">
        <div className="rounded-2xl border border-blue-200 bg-white px-6 py-8 text-center max-w-md space-y-4 shadow">
          <h1 className="text-2xl font-bold text-gray-900">Admin access required</h1>
          <p className="text-gray-600">
            Sign in with an account that has the Admin role to manage rooms and QR codes.
          </p>
          <Button onClick={login} className="w-full">
            Sign in
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
            You’re signed in, but your account isn’t listed in <code>ADMIN_EMAILS</code>. Ask an admin to add your email, then
            sign in again.
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
          <p className="text-gray-600">Manage rooms and QR codes</p>
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
                onClick={() => setActiveTab('qrcodes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'qrcodes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Manage QR Codes
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'rooms' && <RoomManager />}
          {activeTab === 'qrcodes' && <QRCodeManager />}
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
