'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QRScanner } from '@/components/qr/QRScanner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { useRoomStore } from '@/store/roomStore';
import { api } from '@/lib/api';
import { mockLocations } from '@/lib/mock/mockLocations';
import { mockRooms } from '@/lib/mock/mockRooms';

export default function ScanPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { setLocation, setRoom } = useRoomStore();
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/auth/login');
    return null;
  }

  const handleScanSuccess = async (qrData: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const response = await api.verifyQRCode({ qrData });
      const location = await api.getLocation(response.locationId);

      setLocation(location);
      setRoom(mockRooms.find(r => r.id === response.roomId)!);

      router.push(`/room/${response.roomId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'QR code verification failed');
      setShowScanner(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkipQR = (locationId: string) => {
    const location = mockLocations.find(l => l.id === locationId);
    const room = mockRooms.find(r => r.locationId === locationId && r.roomType === 'main');

    if (location && room) {
      setLocation(location);
      setRoom(room);
      router.push(`/room/${room.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Scan QR Code</h1>
          <p className="text-gray-600">
            Scan the QR code at your location to join the chat room
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {showScanner ? 'Position QR Code in Frame' : 'Ready to Scan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {isVerifying && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Verifying QR code...</p>
              </div>
            )}

            {!showScanner && !isVerifying && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">How to scan:</h3>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Click "Start Scanning" below</li>
                    <li>Allow camera access when prompted</li>
                    <li>Position the QR code within the frame</li>
                    <li>Wait for automatic detection</li>
                  </ol>
                </div>

                <Button onClick={() => setShowScanner(true)} className="w-full" size="lg">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  Start Scanning
                </Button>

                {/* Test/Demo Shortcuts */}
                <div className="border-t pt-4 mt-6">
                  <p className="text-sm text-gray-600 mb-3 text-center">Testing shortcuts (skip QR scan):</p>
                  <div className="grid grid-cols-2 gap-2">
                    {mockLocations.map((location) => (
                      <Button
                        key={location.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSkipQR(location.id)}
                      >
                        {location.name.split(' ').slice(-1)[0]}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showScanner && !isVerifying && (
              <div>
                <QRScanner onScanSuccess={handleScanSuccess} />
                <Button
                  variant="outline"
                  onClick={() => setShowScanner(false)}
                  className="w-full mt-4"
                >
                  Cancel Scan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
