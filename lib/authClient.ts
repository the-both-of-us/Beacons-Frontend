'use client';

import {
  PublicClientApplication,
  AccountInfo,
  InteractionRequiredAuthError,
} from '@azure/msal-browser';

const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || '';
export const isAuthConfigured = Boolean(clientId);
const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || 'common';
const authority =
  process.env.NEXT_PUBLIC_AZURE_AD_AUTHORITY ||
  `https://login.microsoftonline.com/${tenantId}`;

const defaultRedirect =
  typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
const redirectUri = process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || defaultRedirect;

const rawScopes =
  process.env.NEXT_PUBLIC_AZURE_AD_SCOPE?.split(',').map((scope) => scope.trim()) || [];
const derivedScope =
  clientId && (!rawScopes || rawScopes.length === 0)
    ? [`api://${clientId}/user_impersonation`]
    : rawScopes;
const scopes = derivedScope.filter(Boolean);

let msalInstance: PublicClientApplication | null = null;
let initializationPromise: Promise<void> | null = null;

const getMsalInstance = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!isAuthConfigured) {
    console.warn(
      'NEXT_PUBLIC_AZURE_AD_CLIENT_ID is not set. Authentication is disabled until this value is provided.'
    );
    return null;
  }

  if (!msalInstance) {
    msalInstance = new PublicClientApplication({
      auth: {
        clientId,
        authority,
        redirectUri: redirectUri || window.location.origin,
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false,
      },
    });
  }

  return msalInstance;
};

const ensureMsalInitialized = async (): Promise<PublicClientApplication | null> => {
  const instance = getMsalInstance();
  if (!instance) {
    return null;
  }

  if (!initializationPromise) {
    initializationPromise = instance.initialize().catch((err) => {
      initializationPromise = null;
      throw err;
    });
  }

  await initializationPromise;
  return instance;
};

export const initializeAuth = async (): Promise<AccountInfo | null> => {
  const instance = await ensureMsalInitialized();
  if (!instance) {
    return null;
  }

  const result = await instance.handleRedirectPromise();
  if (result?.account) {
    instance.setActiveAccount(result.account);
    return result.account;
  }

  const activeAccount =
    instance.getActiveAccount() ?? instance.getAllAccounts()[0] ?? null;

  if (activeAccount) {
    instance.setActiveAccount(activeAccount);
  }

  return activeAccount;
};

export const loginWithRedirect = async () => {
  const instance = await ensureMsalInitialized();
  if (!instance) return;

  await instance.loginRedirect({
    scopes: scopes.length ? scopes : undefined,
    prompt: 'select_account',
  });
};

export const logoutWithRedirect = async () => {
  const instance = await ensureMsalInitialized();
  if (!instance) return;

  await instance.logoutRedirect();
};

export const getAccessToken = async (): Promise<string | null> => {
  const instance = await ensureMsalInitialized();
  if (!instance) return null;

  const account = instance.getActiveAccount();
  if (!account) {
    return null;
  }

  try {
    const response = await instance.acquireTokenSilent({
      scopes: scopes.length ? scopes : undefined,
      account,
    });
    return response.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      await instance.acquireTokenRedirect({
        scopes: scopes.length ? scopes : undefined,
      });
    }
    return null;
  }
};

export const getCurrentAccount = (): AccountInfo | null => {
  if (typeof window === 'undefined' || !msalInstance) {
    return null;
  }
  return msalInstance.getActiveAccount() ?? null;
};
