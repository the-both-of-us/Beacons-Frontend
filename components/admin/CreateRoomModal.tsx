'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { QRCode, Room, RoomTag } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface TagForm extends RoomTag {}

interface CreateRoomModalProps {
  onClose: () => void;
  onSuccess: (room: Room, qrCode: QRCode) => void;
}

export function CreateRoomModal({ onClose, onSuccess }: CreateRoomModalProps) {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [qrExpiresAt, setQrExpiresAt] = useState('');
  const [tags, setTags] = useState<TagForm[]>([
    {
      name: 'location_specific_question',
      displayName: 'Location Specific Q',
      color: '#2563eb',
      enableAiResponse: true,
      enableThreading: true,
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateTag = (index: number, updates: Partial<TagForm>) => {
    setTags((prev) =>
      prev.map((tag, idx) => (idx === index ? { ...tag, ...updates } : tag))
    );
  };

  const addTag = () => {
    setTags((prev) => [
      ...prev,
      {
        name: '',
        displayName: '',
        color: '#0ea5e9',
        enableAiResponse: false,
        enableThreading: false,
      },
    ]);
  };

  const removeTag = (index: number) => {
    setTags((prev) => prev.filter((_, idx) => idx !== index));
  };

  const normalizedTags = tags
    .map((tag) => ({
      name: tag.name.trim() || tag.displayName.trim(),
      displayName: tag.displayName.trim() || tag.name.trim(),
      color: tag.color || '#e5e7eb',
      enableAiResponse: tag.enableAiResponse,
      enableThreading: tag.enableThreading,
    }))
    .filter((tag) => tag.name);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const trimmedLocation = locationName.trim();
    if (!trimmedLocation) {
      setError('Location is required to generate a QR code.');
      return;
    }

    setIsSubmitting(true);
    let createdRoom: Room | null = null;

    try {
      const room = await api.createRoom({
        name: name.trim(),
        description: description.trim() || undefined,
        roomId: roomId.trim() || undefined,
        locationName: trimmedLocation,
        availableTags: normalizedTags,
      });

      createdRoom = room;

      const qrCode = await api.createQRCode({
        roomId: room.id,
        locationName: trimmedLocation,
        expiresAt: qrExpiresAt || undefined,
      });

      onSuccess(room, qrCode);
      onClose();
    } catch (err) {
      if (createdRoom) {
        await api.deleteRoom(createdRoom.id).catch(() => {
          /* ignore rollback failure */
        });
      }
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">New Room</p>
              <h2 className="text-3xl font-bold text-gray-900">Create a Room & QR Code</h2>
              <p className="text-sm text-gray-500">
                Add room details, assign a physical location, and pre-configure message tags.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              aria-label="Close create room modal"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Room Details</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="roomName" className="block text-sm font-medium text-gray-700">
                    Room Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="roomName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Library, Cafeteria"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
                    Custom Room ID (optional)
                  </label>
                  <Input
                    id="roomId"
                    type="text"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="leave empty to auto-generate"
                  />
                  <p className="text-xs text-gray-500">Lowercase letters, numbers, and hyphens only.</p>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="roomDescription" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="roomDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional summary to show in the room list"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location & QR Code</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">
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
                  <p className="text-xs text-gray-500">
                    This appears on the QR code and inside the dashboard.
                  </p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="qrExpiresAt" className="block text-sm font-medium text-gray-700">
                    Expiration Date (optional)
                  </label>
                  <Input
                    id="qrExpiresAt"
                    type="datetime-local"
                    value={qrExpiresAt}
                    onChange={(e) => setQrExpiresAt(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Leave blank for a permanent QR code.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg	font-semibold text-gray-900">Message Tags</h3>
                  <p className="text-sm text-gray-500">
                    Tags appear as quick-select chips when someone posts in the room.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  Add Tag
                </Button>
              </div>

              {tags.length === 0 && (
                <p className="text-sm text-gray-500">
                  No tags defined. Messages in this room won’t have tag options.
                </p>
              )}

              <div className="space-y-4">
                {tags.map((tag, index) => (
                  <div key={index} className="rounded-2xl border border-dashed border-gray-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Tag {index + 1}</p>
                      {tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Tag Name (used internally)
                        </label>
                        <Input
                          value={tag.name}
                          onChange={(e) =>
                            updateTag(index, { name: e.target.value.toLowerCase().replace(/\s+/g, '_') })
                          }
                          placeholder="e.g., location_specific_question"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Display Label (what users see)
                        </label>
                        <Input
                          value={tag.displayName}
                          onChange={(e) => updateTag(index, { displayName: e.target.value })}
                          placeholder="Location Specific Q"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Tag Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={tag.color}
                            onChange={(e) => updateTag(index, { color: e.target.value })}
                            className="h-10 w-12 rounded border border-gray-300"
                          />
                          <Input
                            value={tag.color}
                            onChange={(e) => updateTag(index, { color: e.target.value })}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={tag.enableAiResponse}
                            onChange={(e) => updateTag(index, { enableAiResponse: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Enable AI response
                        </label>
                        <p className="text-xs text-gray-500 mt-1">AI will automatically reply to messages with this tag</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create Room & QR'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
