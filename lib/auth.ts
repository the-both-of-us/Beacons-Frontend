// Authentication helper functions
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const getSessionId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('session_id');
};

export const setSessionId = (sessionId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('session_id', sessionId);
};

export const removeSessionId = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('session_id');
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};
