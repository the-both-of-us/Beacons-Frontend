'use client';

import { signIn, signOut, getSession } from 'next-auth/react';

const publicClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID ||
  process.env.NEXT_PUBLIC_AUTH_CLIENT_ID;

export const isAuthConfigured = Boolean(publicClientId);

export const loginWithRedirect = async () => {
  await signIn('google', { callbackUrl: '/' });
};

export const logoutWithRedirect = async () => {
  await signOut({ callbackUrl: '/' });
};

export const getAccessToken = async (): Promise<string | null> => {
  const session = await getSession();
  return session?.idToken ?? null;
};

export const getCurrentAccount = () => {
  return null;
};

export const initializeAuth = async () => {
  // Auth.js handles initialization automatically
  return null;
};
