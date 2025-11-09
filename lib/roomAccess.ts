/**
 * Room Access Management
 * Tracks which rooms a user has scanned QR codes for
 * Stored in localStorage for persistence
 */

const STORAGE_KEY = 'scannedRooms';

export interface ScannedRoom {
  roomId: string;
  scannedAt: string;
  roomName?: string;
}

/**
 * Get all rooms the user has scanned
 */
export function getScannedRooms(): ScannedRoom[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load scanned rooms:', error);
    return [];
  }
}

/**
 * Add a room to the scanned list
 */
export function addScannedRoom(roomId: string, roomName?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const rooms = getScannedRooms();

    // Check if already exists
    const exists = rooms.find(r => r.roomId === roomId);
    if (exists) {
      // Update the timestamp and name
      exists.scannedAt = new Date().toISOString();
      if (roomName) exists.roomName = roomName;
    } else {
      // Add new room
      rooms.push({
        roomId,
        scannedAt: new Date().toISOString(),
        roomName,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
  } catch (error) {
    console.error('Failed to save scanned room:', error);
  }
}

/**
 * Check if user has scanned a specific room
 */
export function hasScannedRoom(roomId: string): boolean {
  const rooms = getScannedRooms();
  return rooms.some(r => r.roomId === roomId);
}

/**
 * Remove a room from scanned list
 */
export function removeScannedRoom(roomId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const rooms = getScannedRooms();
    const filtered = rooms.filter(r => r.roomId !== roomId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove scanned room:', error);
  }
}

/**
 * Clear all scanned rooms
 */
export function clearScannedRooms(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear scanned rooms:', error);
  }
}

/**
 * Get room IDs that user has access to
 */
export function getAccessibleRoomIds(): string[] {
  return getScannedRooms().map(r => r.roomId);
}
