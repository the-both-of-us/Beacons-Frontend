'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Room, QRCode } from '@/types';
import { Button } from '@/components/ui/Button';
import { CreateQRModal } from './CreateQRModal';
import { CreateRoomModal } from './CreateRoomModal';
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay';

export function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [qrCodes, setQRCodes] = useState<Record<string, QRCode>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewingQRCode, setViewingQRCode] = useState<QRCode | null>(null);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [roomsData, qrCodesData] = await Promise.all([
        api.getRooms(),
        api.getQRCodes(),
      ]);

      setRooms(roomsData);

      // Create a map of room IDs to QR codes
      const qrCodeMap: Record<string, QRCode> = {};
      qrCodesData.forEach((qr) => {
        qrCodeMap[qr.roomId] = qr;
      });
      setQRCodes(qrCodeMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRCodeCreated = (qrCode: QRCode) => {
    setQRCodes((prev) => ({
      ...prev,
      [qrCode.roomId]: qrCode,
    }));
    setSelectedRoom(null);
  };

  const handleRoomCreated = (room: Room) => {
    setRooms((prev) => [room, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-24 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">{error}</p>
        <Button onClick={loadData} variant="outline" size="sm" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
          <p className="text-gray-600">Manage rooms and their QR codes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            Refresh
          </Button>
          <Button onClick={() => setShowCreateRoomModal(true)}>Create Room</Button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600">
          No rooms available
        </div>
      ) : (
        <div className="space-y-4">
          {rooms.map((room) => {
            const qrCode = qrCodes[room.id];
            const hasQR = !!qrCode;

            return (
              <div
                key={room.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                      {hasQR && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Has QR Code
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">ID: {room.id}</p>
                    {room.description && (
                      <p className="text-sm text-gray-500">{room.description}</p>
                    )}
                    {room.availableTags && room.availableTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {room.availableTags.map((tag) => (
                          <span
                            key={tag.name}
                            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: tag.color || '#e5e7eb',
                              color: '#0f172a',
                            }}
                          >
                            {tag.displayName}
                            {tag.enableAiResponse && ' 🤖'}
                            {tag.enableThreading && ' 💬'}
                          </span>
                        ))}
                      </div>
                    )}
                    {hasQR && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Location: <strong>{qrCode.locationName}</strong></p>
                        {qrCode.expiresAt && (
                          <p>Expires: {new Date(qrCode.expiresAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {hasQR ? (
                      <Button
                        onClick={() => setViewingQRCode(qrCode)}
                        variant="outline"
                        size="sm"
                      >
                        View QR Code
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setSelectedRoom(room)}
                        size="sm"
                      >
                        Generate QR Code
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedRoom && (
        <CreateQRModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onSuccess={handleQRCodeCreated}
        />
      )}

      {showCreateRoomModal && (
        <CreateRoomModal
          onClose={() => setShowCreateRoomModal(false)}
          onSuccess={handleRoomCreated}
        />
      )}

      {viewingQRCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">QR Code</h2>
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
