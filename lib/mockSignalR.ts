// Mock SignalR service - simulates real-time SignalR updates
import { Message, AiResponse, Thread } from '@/types';
import { mockMessages, mockAiResponses } from './mock/mockMessages';
import { mockUsers } from './mock/mockUsers';
import { getRoomById, addMockRoom } from './mock/mockRooms';
import { addMockThread } from './mock/mockThreads';

type EventHandler = (...args: any[]) => void;

export class MockSignalRClient {
  private eventHandlers: Map<string, EventHandler[]> = new Map();
  private connected: boolean = false;
  private currentRoomId: string | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor(private accessToken: string) {}

  // Simulate connection
  async start(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        console.log('[MockSignalR] Connected');
        resolve();
      }, 500);
    });
  }

  // Register event handler
  on(eventName: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName)!.push(handler);
  }

  // Invoke a method on the hub (simulated)
  async invoke(methodName: string, ...args: any[]): Promise<void> {
    if (!this.connected) {
      throw new Error('Not connected to SignalR');
    }

    console.log(`[MockSignalR] Invoke: ${methodName}`, args);

    switch (methodName) {
      case 'JoinRoom':
        await this.handleJoinRoom(args[0], args[1]);
        break;
      case 'SendMessage':
        await this.handleSendMessage(args[0], args[1], args[2], args[3], args[4]);
        break;
      case 'VoteMessage':
        await this.handleVoteMessage(args[0], args[1], args[2]);
        break;
      case 'LeaveRoom':
        await this.handleLeaveRoom(args[0]);
        break;
    }
  }

  // Handle joining a room
  private async handleJoinRoom(roomId: string, accessToken: string): Promise<void> {
    this.currentRoomId = roomId;

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Emit UserJoined event
    this.emit('UserJoined', {
      username: 'You',
      userId: 'current_user',
    });

    // Send message history
    const messages = mockMessages.filter(m => m.roomId === roomId);
    this.emit('MessageHistory', messages);

    // Start simulating new messages from other users
    this.startMessageSimulation(roomId);
  }

  // Handle sending a message
  private async handleSendMessage(
    roomId: string,
    content: string,
    tags: string[],
    accessToken: string,
    parentThreadId?: string | null
  ): Promise<void> {
    const currentUser = JSON.parse(localStorage.getItem('mockUser') || '{}');
    const room = getRoomById(roomId);
    const locationId = room?.locationId || 'loc_classroom_a101';
    const resolvedParentThreadId = parentThreadId ?? null;
    const isThreadStarter = tags.includes('location_specific_question') && !resolvedParentThreadId;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      type: 'message',
      roomId,
      locationId,
      userId: currentUser.id,
      content,
      tags,
      isThreadStarter,
      parentThreadId: resolvedParentThreadId,
      votes: {
        upvotes: 0,
        downvotes: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      username: currentUser.username || undefined,
      isAnonymous: currentUser.isAnonymous,
    };

    // Add to mock messages
    mockMessages.push(newMessage);

    // Emit the message to all clients (including sender)
    this.emit('MessageReceived', newMessage);

    // If it's a location_specific_question, create a thread and trigger AI
    if (isThreadStarter) {
      const threadId = `thread_${newMessage.id}`;
      const thread: Thread = {
        id: threadId,
        roomId: threadId,
        originalMessageId: newMessage.id,
        locationId: newMessage.locationId,
        createdAt: newMessage.createdAt,
      };

      addMockThread(thread);
      addMockRoom({
        id: threadId,
        type: 'room',
        locationId: newMessage.locationId,
        roomType: 'thread',
        parentThreadId: newMessage.id,
        filterCriteria: {},
        createdAt: newMessage.createdAt,
        isActive: true,
      });

      this.emit('ThreadCreated', thread);

      // Simulate AI response after 3 seconds
      setTimeout(() => {
        this.simulateAiResponse(thread.id, newMessage);
      }, 3000);
    }
  }

  // Handle voting on a message
  private async handleVoteMessage(
    messageId: string,
    voteType: string,
    accessToken: string
  ): Promise<void> {
    const message = mockMessages.find(m => m.id === messageId);
    if (!message) return;

    if (voteType === 'up') {
      message.votes.upvotes++;
    } else {
      message.votes.downvotes++;
    }

    this.emit('VoteUpdated', {
      messageId,
      upvotes: message.votes.upvotes,
      downvotes: message.votes.downvotes,
    });
  }

  // Handle leaving a room
  private async handleLeaveRoom(roomId: string): Promise<void> {
    this.currentRoomId = null;
    this.stopMessageSimulation();

    this.emit('UserLeft', 'current_user');
  }

  // Emit an event to all registered handlers
  private emit(eventName: string, data: any): void {
    const handlers = this.eventHandlers.get(eventName) || [];
    handlers.forEach(handler => handler(data));
  }

  // Simulate new messages appearing from other users
  private startMessageSimulation(roomId: string): void {
    // Clear any existing simulation
    this.stopMessageSimulation();

    // Every 15 seconds, add a random message from another user
    this.simulationInterval = setInterval(() => {
      if (this.currentRoomId !== roomId) {
        this.stopMessageSimulation();
        return;
      }

      const room = getRoomById(roomId);
      const locationId = room?.locationId || 'loc_classroom_a101';
      const randomUser = mockUsers[Math.floor(Math.random() * 2)]; // Use first 2 users
      const randomMessages = [
        'Anyone know when the next class is?',
        'Great discussion today!',
        'Does anyone have the notes from last week?',
        'Thanks for the help everyone!',
        'Is the professor here yet?',
      ];

      const randomMessage: Message = {
        id: `msg_sim_${Date.now()}`,
        type: 'message',
        roomId,
        locationId,
        userId: randomUser.id,
        content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        tags: [],
        isThreadStarter: false,
        parentThreadId: null,
        votes: {
          upvotes: 0,
          downvotes: 0,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        username: randomUser.username || undefined,
        isAnonymous: randomUser.isAnonymous,
      };

      mockMessages.push(randomMessage);
      this.emit('MessageReceived', randomMessage);
    }, 15000); // Every 15 seconds
  }

  // Stop message simulation
  private stopMessageSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }

  // Simulate AI response
  private simulateAiResponse(threadId: string, originalMessage: Message): void {
    const aiResponses = [
      'Based on the information available, the answer to your question is...',
      'I can help with that! Here\'s what I found...',
      'Great question! According to the latest information...',
      'Let me provide some context on this topic...',
    ];

    const aiResponse: AiResponse = {
      id: `ai_${Date.now()}`,
      type: 'ai_response' as const,
      messageId: originalMessage.id,
      threadId,
      locationId: originalMessage.locationId,
      responseText: aiResponses[Math.floor(Math.random() * aiResponses.length)] + ' ' + originalMessage.content,
      confidenceScore: 0.85 + Math.random() * 0.1,
      modelVersion: 'gpt-4',
      sources: [],
      votes: {
        upvotes: 0,
        downvotes: 0,
      },
      createdAt: new Date().toISOString(),
    };

    mockAiResponses.push(aiResponse);
    this.emit('AiResponse', aiResponse);
  }

  // Stop the connection
  stop(): void {
    this.stopMessageSimulation();
    this.connected = false;
    this.eventHandlers.clear();
    console.log('[MockSignalR] Disconnected');
  }
}

// Export a singleton instance creator
export const createMockSignalRClient = (accessToken: string): MockSignalRClient => {
  return new MockSignalRClient(accessToken);
};
