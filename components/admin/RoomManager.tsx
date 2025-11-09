'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Room, QRCode } from '@/types';
import { Button } from '@/components/ui/Button';
import { CreateRoomModal } from './CreateRoomModal';
import { QRCodeDisplay } from '@/components/qr/QRCodeDisplay';

const SparkleIcon = () => (
  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path d="M10 2l1.2 3.5L15 6.8l-3.1 2.2.9 3.6L10 10.9 7.2 12.6l.9-3.6L5 6.8l3.8-.3L10 2zM4 12l.8 2.2L7 14.6l-1.7 1.2.5 2.2L4 16.8l-1.9 1.2.5-2.2L1 14.6l2.2-.4L4 12zm12 0l.8 2.2 2.2.4-1.7 1.2.5 2.2L16 16.8l-1.9 1.2.5-2.2L13 14.6l2.2-.4L16 12z" />
  </svg>
);

const ThreadIcon = () => (
  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 5v6a4 4 0 004 4h2a4 4 0 014 4M7 5h2M7 5H5m12 14h2" />
    <circle cx="5" cy="5" r="2" />
    <circle cx="17" cy="19" r="2" />
  </svg>
);

const indicatorClass = 'inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm';

export function RoomManager() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [qrCodes, setQRCodes] = useState<Record<string, QRCode | undefined>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewingQRCode, setViewingQRCode] = useState<QRCode | null>(null);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

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

      const sortedRooms = roomsData.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRooms(sortedRooms);

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

  const handleRoomCreated = (room: Room, qrCode: QRCode) => {
    setRooms((prev) => [room, ...prev]);
    setQRCodes((prev) => ({
      ...prev,
      [room.id]: qrCode,
    }));
    setViewingQRCode(qrCode);
  };

  const handleDeleteRoom = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    const confirmed = window.confirm(
      `Delete "${room.name}" room and its QR codes/messages? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingRoomId(roomId);
    try {
      await api.deleteRoom(roomId);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
      setQRCodes((prev) => {
        const next = { ...prev };
        delete next[roomId];
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete room');
    } finally {
      setDeletingRoomId(null);
    }
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
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
          <p className="text-gray-600">
            Create rooms with linked QR codes, manage tags, and keep locations up to date.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
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
            const locationDisplay = room.locationName || qrCode?.locationName;
            const createdDate = new Date(room.createdAt).toLocaleString();

            return (
              <div
                key={room.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{room.name}</h3>
                        <p className="text-xs text-gray-500">ID: {room.id}</p>
                      </div>
                      {locationDisplay && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a3 3 0 100-6 3 3 0 000 6z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4.5 8-11a8 8 0 10-16 0c0 6.5 8 11 8 11z" />
                          </svg>
                          {locationDisplay}
                        </span>
                      )}
                    </div>

                    {room.description && (
                      <p className="text-sm text-gray-600">{room.description}</p>
                    )}

                    <p className="text-xs text-gray-400">Created {createdDate}</p>

                    {room.availableTags && room.availableTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {room.availableTags.map((tag) => (
                          <span
                            key={tag.name}
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm"
                            style={{
                              backgroundColor: tag.color || '#e5e7eb',
                              color: '#0f172a',
                            }}
                          >
                            {tag.displayName}
                            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase text-slate-700">
                              {tag.enableAiResponse && (
                                <span className={indicatorClass}>
                                  <SparkleIcon />
                                  AI
                                </span>
                              )}
                              {tag.enableThreading && (
                                <span className={indicatorClass}>
                                  <ThreadIcon />
                                  Threads
                                </span>
                              )}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    {qrCode ? (
                      <Button
                        onClick={() => setViewingQRCode(qrCode)}
                        variant="outline"
                        size="sm"
                      >
                        View QR Code
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" disabled>
                        QR Pending
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteRoom(room.id)}
                      disabled={deletingRoomId === room.id}
                    >
                      {deletingRoomId === room.id ? 'Deleting…' : 'Delete Room'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
