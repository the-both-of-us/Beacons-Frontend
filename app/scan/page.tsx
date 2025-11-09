'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Room } from '@/types';
import { Button } from '@/components/ui/Button';
import { QRScanner } from '@/components/qr/QRScanner';
import { useAuth } from '@/context/AuthContext';

type Tab = 'scan' | 'browse';

export default function ScanPage() {
  const router = useRouter();
  const { account, loading: authLoading, login } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    api
      .getRooms()
      .then((data) => {
        if (active) setRooms(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load rooms');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleQRScan = async (code: string) => {
    setIsValidating(true);
    setQrError(null);

    try {
      const validation = await api.verifyQRCode(code);

      if (validation.isValid && validation.roomId) {
        // Successfully validated, redirect to room
        router.push(`/room/${encodeURIComponent(validation.roomId)}`);
      } else {
        setQrError('Invalid or expired QR code. Please try again.');
      }
    } catch (err) {
      setQrError(err instanceof Error ? err.message : 'Failed to validate QR code');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="container mx-auto max-w-4xl py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Join a Room</h1>
          <p className="text-gray-600">
            Scan a QR code or browse available rooms
          </p>
        </div>

        {!account && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>
              You can scan QR codes without signing in. To send messages, sign in with your Microsoft account.
            </span>
            <Button size="sm" variant="outline" onClick={login} disabled={authLoading}>
              Sign In
            </Button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              onClick={() => setActiveTab('scan')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'scan'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Scan QR
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Browse Rooms
            </button>
          </div>
        </div>

        {/* QR Scanner Tab */}
        {activeTab === 'scan' && (
          <div className="mb-6">
            {qrError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 mb-4">
                {qrError}
              </div>
            )}

            {isValidating && (
              <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 mb-4">
                Validating QR code...
              </div>
            )}

            <QRScanner
              onScanSuccess={handleQRScan}
              onScanError={(err) => setQrError(err)}
            />
          </div>
        )}

        {/* Browse Rooms Tab */}
        {activeTab === 'browse' && (
          <>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 mb-6">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-20 animate-pulse rounded-2xl bg-white/70" />
                ))}
              </div>
            ) : rooms.length ? (
              <div className="space-y-4">
                {rooms.map((room) => (
                  <div key={room.id} className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-wide text-blue-600">Room</p>
                        <p className="text-lg font-semibold text-gray-900">{room.name}</p>
                        <p className="text-sm text-gray-600">ID: {room.id}</p>
                        {room.description && (
                          <p className="mt-1 text-sm text-gray-500">{room.description}</p>
                        )}
                      </div>
                      <Link href={`/room/${encodeURIComponent(room.id)}`}>
                        <Button>Join Room</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center text-gray-600">
                No rooms available. Make sure the backend is running and seeded.
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
