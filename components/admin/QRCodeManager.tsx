'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { QRCode } from '@/types';
import { Button } from '@/components/ui/Button';
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay';

export function QRCodeManager() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingQRCode, setViewingQRCode] = useState<QRCode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getQRCodes();
      setQRCodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load QR codes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async (qrCode: QRCode) => {
    if (!confirm(`Are you sure you want to deactivate the QR code for "${qrCode.roomName}" at "${qrCode.locationName}"?`)) {
      return;
    }

    try {
      await api.deactivateQRCode(qrCode.id);
      // Remove from list (or reload)
      setQRCodes((prev) => prev.filter((qr) => qr.id !== qrCode.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to deactivate QR code');
    }
  };

  const filteredQRCodes = qrCodes.filter((qr) =>
    qr.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qr.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (qrCode: QRCode) => {
    if (!qrCode.isActive) return { text: 'Inactive', color: 'gray' };
    if (qrCode.expiresAt && new Date(qrCode.expiresAt) < new Date()) {
      return { text: 'Expired', color: 'red' };
    }
    return { text: 'Active', color: 'green' };
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="h-20 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <Button onClick={loadQRCodes} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">QR Code Management</h2>
        <p className="text-gray-600">View and manage all QR codes</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by room name, location, or QR code ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredQRCodes.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
          {searchTerm ? 'No QR codes match your search' : 'No QR codes available'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQRCodes.map((qrCode) => {
            const status = getStatus(qrCode);

            return (
              <div
                key={qrCode.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{qrCode.roomName}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          status.color === 'green'
                            ? 'bg-green-100 text-green-800'
                            : status.color === 'red'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {status.text}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">Location:</span> {qrCode.locationName}
                      </p>
                      <p>
                        <span className="font-medium">Room ID:</span> {qrCode.roomId}
                      </p>
                      <p>
                        <span className="font-medium">QR Code ID:</span>{' '}
                        <code className="bg-gray-100 px-1 rounded">{qrCode.id}</code>
                      </p>
                      <p>
                        <span className="font-medium">Created:</span>{' '}
                        {new Date(qrCode.createdAt).toLocaleDateString()} at{' '}
                        {new Date(qrCode.createdAt).toLocaleTimeString()}
                      </p>
                      {qrCode.expiresAt && (
                        <p>
                          <span className="font-medium">Expires:</span>{' '}
                          {new Date(qrCode.expiresAt).toLocaleDateString()} at{' '}
                          {new Date(qrCode.expiresAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setViewingQRCode(qrCode)}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                    {qrCode.isActive && (
                      <Button
                        onClick={() => handleDeactivate(qrCode)}
                        variant="outline"
                        size="sm"
                      >
                        Deactivate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewingQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">QR Code Details</h2>
              <button
                onClick={() => setViewingQRCode(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <QRCodeDisplay
              code={viewingQRCode.id}
              locationName={viewingQRCode.locationName}
              roomName={viewingQRCode.roomName}
            />

            <div className="mt-4 flex justify-end">
              <Button onClick={() => setViewingQRCode(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
