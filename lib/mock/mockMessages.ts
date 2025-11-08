import { Message, AiResponse } from '@/types';

export const mockMessages: Message[] = [
  {
    id: 'msg_1',
    type: 'message',
    roomId: 'room_classroom_a101_main',
    locationId: 'loc_classroom_a101',
    userId: 'user_1',
    content: 'Where is the nearest bathroom?',
    tags: ['location_specific_question'],
    isThreadStarter: true,
    parentThreadId: null,
    votes: {
      upvotes: 5,
      downvotes: 0,
    },
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    username: 'john_doe',
    isAnonymous: false,
  },
  {
    id: 'msg_2',
    type: 'message',
    roomId: 'thread_bathroom_question',
    locationId: 'loc_classroom_a101',
    userId: 'user_2',
    content: "It's down the hall to the left, next to the water fountain!",
    tags: [],
    isThreadStarter: false,
    parentThreadId: 'thread_bathroom_question',
    votes: {
      upvotes: 8,
      downvotes: 0,
    },
    createdAt: new Date(Date.now() - 3500000).toISOString(),
    updatedAt: new Date(Date.now() - 3500000).toISOString(),
    username: 'jane_smith',
    isAnonymous: false,
  },
  {
    id: 'msg_3',
    type: 'message',
    roomId: 'room_classroom_a101_main',
    locationId: 'loc_classroom_a101',
    userId: 'user_3',
    content: 'Is anyone else having trouble accessing the WiFi?',
    tags: [],
    isThreadStarter: false,
    parentThreadId: null,
    votes: {
      upvotes: 3,
      downvotes: 0,
    },
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    username: undefined,
    isAnonymous: true,
  },
  {
    id: 'msg_4',
    type: 'message',
    roomId: 'room_classroom_a101_main',
    locationId: 'loc_classroom_a101',
    userId: 'user_1',
    content: 'The network password changed yesterday. Check your email for the update.',
    tags: [],
    isThreadStarter: false,
    parentThreadId: null,
    votes: {
      upvotes: 12,
      downvotes: 0,
    },
    createdAt: new Date(Date.now() - 1700000).toISOString(),
    updatedAt: new Date(Date.now() - 1700000).toISOString(),
    username: 'john_doe',
    isAnonymous: false,
  },
  {
    id: 'msg_5',
    type: 'message',
    roomId: 'room_classroom_a101_main',
    locationId: 'loc_classroom_a101',
    userId: 'user_4',
    content: 'What time does the lecture start?',
    tags: ['location_specific_question'],
    isThreadStarter: true,
    parentThreadId: null,
    votes: {
      upvotes: 2,
      downvotes: 0,
    },
    createdAt: new Date(Date.now() - 900000).toISOString(),
    updatedAt: new Date(Date.now() - 900000).toISOString(),
    username: undefined,
    isAnonymous: true,
  },
  {
    id: 'msg_6',
    type: 'message',
    roomId: 'thread_lecture_time',
    locationId: 'loc_classroom_a101',
    userId: 'user_2',
    content: 'The instructor usually starts right on time at 11:00 AM. Seats fill up fast.',
    tags: [],
    isThreadStarter: false,
    parentThreadId: 'thread_lecture_time',
    votes: {
      upvotes: 6,
      downvotes: 0,
    },
    createdAt: new Date(Date.now() - 850000).toISOString(),
    updatedAt: new Date(Date.now() - 850000).toISOString(),
    username: 'jane_smith',
    isAnonymous: false,
  },
];

export const mockAiResponses: AiResponse[] = [
  {
    id: 'ai_1',
    type: 'ai_response',
    messageId: 'msg_1',
    threadId: 'thread_bathroom_question',
    locationId: 'loc_classroom_a101',
    responseText: 'The nearest restroom is located on the 3rd floor, approximately 50 meters down the hallway to your left when exiting room A101. Look for the blue signage near room A105.',
    confidenceScore: 0.92,
    modelVersion: 'gpt-4',
    sources: [
      { type: 'location_context', id: 'building_map_v2' },
      { type: 'past_thread', id: 'thread_123' },
    ],
    votes: {
      upvotes: 15,
      downvotes: 1,
    },
    createdAt: new Date(Date.now() - 3550000).toISOString(),
  },
  {
    id: 'ai_2',
    type: 'ai_response',
    messageId: 'msg_5',
    threadId: 'thread_lecture_time',
    locationId: 'loc_classroom_a101',
    responseText: 'Based on the current schedule for room A101, lectures typically start at 9:00 AM, 11:00 AM, and 2:00 PM on weekdays. Please verify with your specific course syllabus for exact timing.',
    confidenceScore: 0.85,
    modelVersion: 'gpt-4',
    sources: [
      { type: 'location_context', id: 'schedule_data' },
    ],
    votes: {
      upvotes: 8,
      downvotes: 0,
    },
    createdAt: new Date(Date.now() - 897000).toISOString(),
  },
];

export const getMessagesByRoomId = (roomId: string): Message[] => {
  return mockMessages.filter(msg => msg.roomId === roomId);
};

export const getMessageById = (id: string): Message | undefined => {
  return mockMessages.find(msg => msg.id === id);
};

export const getAiResponseByMessageId = (messageId: string): AiResponse | undefined => {
  return mockAiResponses.find(ai => ai.messageId === messageId);
};

export const getThreadMessages = (threadId: string): Message[] => {
  return mockMessages.filter(msg => msg.parentThreadId === threadId);
};
