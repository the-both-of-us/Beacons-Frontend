import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user_1',
    type: 'user',
    username: 'john_doe',
    email: 'john@example.com',
    isAnonymous: false,
    gender: 'male',
    age: 22,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'user_2',
    type: 'user',
    username: 'jane_smith',
    email: 'jane@example.com',
    isAnonymous: false,
    gender: 'female',
    age: 21,
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'user_3',
    type: 'user',
    username: null,
    isAnonymous: true,
    sessionId: 'anon_session_123',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'user_4',
    type: 'user',
    username: null,
    isAnonymous: true,
    sessionId: 'anon_session_456',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
];

export const getCurrentMockUser = (): User | null => {
  // Check if there's a stored user in localStorage
  if (typeof window === 'undefined') return null;

  const storedUser = localStorage.getItem('mockUser');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
};

export const setCurrentMockUser = (user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mockUser', JSON.stringify(user));
};

export const clearCurrentMockUser = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('mockUser');
};
