// Mock API service - simulates backend API calls
import {
  User,
  AuthResponse,
  LoginRequest,
  SignUpRequest,
  Message,
  AiResponse,
  QrVerificationRequest,
  QrVerificationResponse,
  Location,
  Room,
  Thread,
} from '@/types';
import { mockUsers, setCurrentMockUser } from './mock/mockUsers';
import { mockLocations, getLocationById } from './mock/mockLocations';
import { getRoomById, getRoomByLocationId, addMockRoom } from './mock/mockRooms';
import {
  mockMessages,
  getMessagesByRoomId,
  getMessageById,
  getAiResponseByMessageId,
  getThreadMessages,
} from './mock/mockMessages';
import { parseQRData, verifyQRCode } from './mock/mockQRCodes';
import { setToken, setSessionId, generateSessionId } from './auth';
import { delay } from './utils';
import {
  getThreadById,
  getThreadsByLocationId,
  addMockThread,
} from './mock/mockThreads';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Simulated API delay (300ms)
const API_DELAY = 300;

interface ThreadDetails {
  thread: Thread;
  originalMessage: Message;
  replies: Message[];
  aiResponse?: AiResponse;
}

export const api = {
  // Authentication endpoints
  async login(request: LoginRequest): Promise<AuthResponse> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      // TODO: Replace with real API call
      throw new Error('Real API not implemented yet');
    }

    // Mock login
    const user = mockUsers.find(
      u => u.email === request.email && !u.isAnonymous
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const mockToken = `mock_jwt_token_${user.id}_${Date.now()}`;

    setToken(mockToken);
    setCurrentMockUser(user);

    return {
      token: mockToken,
      user,
    };
  },

  async signup(request: SignUpRequest): Promise<AuthResponse> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    // Create new mock user
    const newUser: User = {
      id: `user_${Date.now()}`,
      type: 'user',
      username: request.username,
      email: request.email,
      isAnonymous: false,
      gender: request.gender,
      age: request.age,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    const mockToken = `mock_jwt_token_${newUser.id}_${Date.now()}`;

    setToken(mockToken);
    setCurrentMockUser(newUser);

    return {
      token: mockToken,
      user: newUser,
    };
  },

  async createAnonymousSession(): Promise<AuthResponse> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    const sessionId = generateSessionId();

    const anonUser: User = {
      id: `user_anon_${Date.now()}`,
      type: 'user',
      username: null,
      isAnonymous: true,
      sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(anonUser);

    const mockToken = `mock_jwt_token_anon_${sessionId}`;

    setToken(mockToken);
    setSessionId(sessionId);
    setCurrentMockUser(anonUser);

    return {
      token: mockToken,
      user: anonUser,
    };
  },

  async getCurrentUser(): Promise<User> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    // Get from localStorage
    const storedUser = localStorage.getItem('mockUser');
    if (!storedUser) {
      throw new Error('Not authenticated');
    }

    return JSON.parse(storedUser);
  },

  // QR Code endpoints
  async verifyQRCode(request: QrVerificationRequest): Promise<QrVerificationResponse> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    // Verify QR code
    if (!verifyQRCode(request.qrData)) {
      throw new Error('Invalid or expired QR code');
    }

    const payload = parseQRData(request.qrData);
    if (!payload) {
      throw new Error('Invalid QR code format');
    }

    const location = getLocationById(payload.location_id);
    if (!location) {
      throw new Error('Location not found');
    }

    const room = getRoomByLocationId(location.id, 'main');
    if (!room) {
      throw new Error('Room not found for location');
    }

    return {
      locationId: location.id,
      locationName: location.name,
      roomId: room.id,
      isValid: true,
    };
  },

  // Location endpoints
  async getAllLocations(): Promise<Location[]> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    return mockLocations;
  },

  async getLocation(id: string): Promise<Location> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    const location = getLocationById(id);
    if (!location) {
      throw new Error('Location not found');
    }

    return location;
  },

  async getRoom(id: string): Promise<Room> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    const room = getRoomById(id);
    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  },

  async getThreadsForLocation(locationId: string): Promise<Thread[]> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    return getThreadsByLocationId(locationId);
  },

  async getThreadDetails(threadId: string): Promise<ThreadDetails> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    const thread = getThreadById(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    const originalMessage = getMessageById(thread.originalMessageId);
    if (!originalMessage) {
      throw new Error('Original message not found');
    }

    const replies = getThreadMessages(thread.id);
    const aiResponse = getAiResponseByMessageId(thread.originalMessageId);

    return {
      thread,
      originalMessage,
      replies,
      aiResponse,
    };
  },

  // Message endpoints
  async getMessages(roomId: string): Promise<Message[]> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    return getMessagesByRoomId(roomId);
  },

  async sendMessage(
    roomId: string,
    content: string,
    tags: string[],
    options?: { parentThreadId?: string | null }
  ): Promise<Message> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    const room = getRoomById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }
    const locationId = room.locationId;
    const parentThreadId = options?.parentThreadId ?? null;
    const isThreadStarter = tags.includes('location_specific_question') && !parentThreadId;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'message',
      roomId,
      locationId,
      userId: currentUser.id,
      content,
      tags,
      isThreadStarter,
      parentThreadId,
      votes: {
        upvotes: 0,
        downvotes: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      username: currentUser.username,
      isAnonymous: currentUser.isAnonymous,
    };

    mockMessages.push(newMessage);

    if (isThreadStarter) {
      const threadId = `thread_${newMessage.id}`;
      const newThread: Thread = {
        id: threadId,
        roomId: threadId,
        originalMessageId: newMessage.id,
        locationId: newMessage.locationId,
        createdAt: newMessage.createdAt,
      };

      addMockThread(newThread);
      addMockRoom({
        id: threadId,
        type: 'room',
        locationId: newMessage.locationId,
        roomType: 'thread',
        parentThreadId: newMessage.id,
        filterCriteria: {},
        createdAt: new Date().toISOString(),
        isActive: true,
      });
    }

    return newMessage;
  },

  async voteMessage(messageId: string, voteType: 'up' | 'down'): Promise<void> {
    await delay(API_DELAY);

    if (!USE_MOCK) {
      throw new Error('Real API not implemented yet');
    }

    const message = mockMessages.find(m => m.id === messageId);
    if (!message) {
      throw new Error('Message not found');
    }

    if (voteType === 'up') {
      message.votes.upvotes++;
    } else {
      message.votes.downvotes++;
    }
  },
};
