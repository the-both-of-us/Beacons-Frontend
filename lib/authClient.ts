'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export const isAuthConfigured = Boolean(process.env.GOOGLE_CLIENT_ID);

export const loginWithRedirect = async () => {
  await signIn('google', { callbackUrl: '/' });
};

export const logoutWithRedirect = async () => {
  await signOut({ callbackUrl: '/' });
};

export const getAccessToken = async (): Promise<string | null> => {
  // Note: With Google OAuth, you don't need to pass tokens to your backend
  // The backend will be public for most operations
  return null;
};

export const getCurrentAccount = () => {
  // This should be called within a component that has SessionProvider
  // Use useSession hook instead
  return null;
};

export const initializeAuth = async () => {
  // Auth.js handles initialization automatically
  return null;
};
