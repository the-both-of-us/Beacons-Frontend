export interface User {
  id: string;
  type: 'user';
  username: string | null;
  email?: string;
  passwordHash?: string;
  isAnonymous: boolean;
  sessionId?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  age?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  age?: number;
}

export interface ConvertAnonymousRequest {
  username: string;
  email: string;
  password: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  age?: number;
}
