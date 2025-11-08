import { Thread } from '@/types';

export const mockThreads: Thread[] = [
  {
    id: 'thread_bathroom_question',
    roomId: 'thread_bathroom_question',
    originalMessageId: 'msg_1',
    locationId: 'loc_classroom_a101',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'thread_lecture_time',
    roomId: 'thread_lecture_time',
    originalMessageId: 'msg_5',
    locationId: 'loc_classroom_a101',
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

export const getThreadById = (id: string): Thread | undefined => {
  return mockThreads.find(thread => thread.id === id);
};

export const getThreadByMessageId = (messageId: string): Thread | undefined => {
  return mockThreads.find(thread => thread.originalMessageId === messageId);
};

export const getThreadsByLocationId = (locationId: string): Thread[] => {
  return mockThreads.filter(thread => thread.locationId === locationId);
};

export const addMockThread = (thread: Thread): void => {
  mockThreads.push(thread);
};
