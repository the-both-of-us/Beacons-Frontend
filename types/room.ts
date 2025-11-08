export interface Room {
  id: string;
  type: 'room';
  locationId: string;
  roomType: 'main' | 'thread';
  parentThreadId: string | null;
  filterCriteria: {
    gender?: string | null;
    ageRange?: [number, number] | null;
  };
  createdAt: string;
  isActive: boolean;
}

export interface Thread {
  id: string;
  roomId: string;
  originalMessageId: string;
  locationId: string;
  createdAt: string;
}
