'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Room, QRCode } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay';

interface CreateQRModalProps {
  room: Room;
  onClose: () => void;
  onSuccess: (qrCode: QRCode) => void;
}

export function CreateQRModal({ room, onClose, onSuccess }: CreateQRModalProps) {
  const [locationName, setLocationName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdQRCode, setCreatedQRCode] = useState<QRCode | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const qrCode = await api.createQRCode({
        roomId: room.id,
        locationName,
        expiresAt: expiresAt || undefined,
      });

      setCreatedQRCode(qrCode);
      onSuccess(qrCode);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create QR code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {createdQRCode ? 'QR Code Created' : 'Create QR Code'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {!createdQRCode ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Creating QR code for room: <strong>{room.name}</strong>
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="locationName" className="block text-sm font-medium text-gray-700 mb-1">
                      Location Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="locationName"
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g., Library Entrance, Main Hall"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Physical location where this QR code will be displayed
                    </p>
                  </div>

                  <div>
                    <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date (Optional)
                    </label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Leave empty for permanent QR code
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" onClick={onClose} variant="outline">
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !locationName.trim()}>
                  {isLoading ? 'Creating...' : 'Create QR Code'}
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <div className="mb-6 text-center">
                <p className="text-green-600 font-medium mb-4">
                  QR code created successfully!
                </p>
                <QRCodeDisplay
                  code={createdQRCode.id}
                  locationName={createdQRCode.locationName}
                  roomName={createdQRCode.roomName}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={onClose}>Done</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
