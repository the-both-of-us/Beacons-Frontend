const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const DEFAULT_API_BASE = 'http://localhost:5211';

const envApiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export const API_BASE_URL = trimTrailingSlash(envApiBase || DEFAULT_API_BASE);

export const SIGNALR_URL = (() => {
  const base = process.env.NEXT_PUBLIC_SIGNALR_URL;
  if (base) {
    return trimTrailingSlash(base);
  }
  return `${API_BASE_URL}/chatHub`;
})();
