export interface Room {
  id: string;
  name: string;
  description?: string;
  locationName?: string;
  createdAt: string;
  availableTags?: RoomTag[];
}

export interface RoomTag {
  name: string;
  displayName: string;
  color: string;
  enableAiResponse: boolean;
  enableThreading: boolean;
}

export interface CreateRoomRequest {
  name: string;
  description?: string;
  roomId?: string;
  locationName: string;
  availableTags?: RoomTag[];
}
