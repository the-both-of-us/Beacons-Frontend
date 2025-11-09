import { API_BASE_URL } from './config';
import { getAccessToken } from './authClient';
import {
  Message,
  Room,
  QRCode,
  CreateQRCodeRequest,
  QRValidationResponse,
  CreateRoomRequest,
  VoteUpdate,
} from '@/types';

interface RoomTagDto {
  name: string;
  displayName: string;
  color: string;
  enableAiResponse: boolean;
  enableThreading: boolean;
}

interface RoomDto {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  availableTags?: RoomTagDto[];
}

interface MessageDto {
  id: string;
  roomId: string;
  username: string;
  message: string;
  timestamp: string;
}

const buildUrl = (path: string) => {
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};

const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const headers = new Headers(init.headers || {});

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (typeof window !== 'undefined') {
    const token = await getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const mapRoomDto = (dto: RoomDto): Room => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  createdAt: dto.createdAt,
  availableTags: dto.availableTags?.map((tag) => ({
    name: tag.name,
    displayName: tag.displayName,
    color: tag.color || '#e5e7eb',
    enableAiResponse: tag.enableAiResponse,
    enableThreading: tag.enableThreading,
  })),
});

const mapMessageDto = (dto: MessageDto): Message => ({
  id: dto.id,
  roomId: dto.roomId,
  username: dto.username,
  message: dto.message,
  timestamp: dto.timestamp,
});

export const api = {
  async getRooms(): Promise<Room[]> {
    const rooms = await request<RoomDto[]>('/api/rooms');
    return rooms.map(mapRoomDto);
  },

  async getRoom(roomId: string): Promise<Room> {
    const room = await request<RoomDto>(`/api/rooms/${encodeURIComponent(roomId)}`);
    return mapRoomDto(room);
  },

  async getRoomMessages(roomId: string, hours = 1): Promise<Message[]> {
    const messages = await request<MessageDto[]>(
      `/api/rooms/${encodeURIComponent(roomId)}/messages?hours=${hours}`
    );
    return messages.map(mapMessageDto);
  },

  async createRoom(data: CreateRoomRequest): Promise<Room> {
    return request<Room>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify({
        id: data.roomId || undefined,
        name: data.name,
        description: data.description,
        availableTags: data.availableTags,
      }),
    });
  },

  // QR Code endpoints
  async verifyQRCode(code: string): Promise<QRValidationResponse> {
    return request<QRValidationResponse>(`/api/qrcodes/verify/${encodeURIComponent(code)}`);
  },

  async createQRCode(data: CreateQRCodeRequest): Promise<QRCode> {
    return request<QRCode>('/api/qrcodes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getQRCodes(): Promise<QRCode[]> {
    return request<QRCode[]>('/api/qrcodes');
  },

  async getQRCodeByRoom(roomId: string): Promise<QRCode> {
    return request<QRCode>(`/api/qrcodes/room/${encodeURIComponent(roomId)}`);
  },

  async deactivateQRCode(qrCodeId: string): Promise<void> {
    return request<void>(`/api/qrcodes/${encodeURIComponent(qrCodeId)}`, {
      method: 'DELETE',
    });
  },

  async voteMessage(
    roomId: string,
    messageId: string,
    voteType: 'up' | 'down',
    voterId?: string
  ): Promise<VoteUpdate> {
    return request<VoteUpdate>(`/api/messages/${encodeURIComponent(messageId)}/vote`, {
      method: 'POST',
      body: JSON.stringify({
        roomId,
        voteType,
        voterId,
      }),
    });
  },
};
