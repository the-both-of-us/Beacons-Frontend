const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

interface Grecaptcha {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
}

let scriptLoadingPromise: Promise<void> | null = null;

const ensureSiteKey = (): string => {
  if (!SITE_KEY) {
    throw new Error('reCAPTCHA site key is not configured.');
  }

  return SITE_KEY;
};

const loadRecaptchaScript = (siteKey: string): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA cannot load on the server.');
  }

  if (window.grecaptcha) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[src*="recaptcha/api.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load reCAPTCHA.')));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load reCAPTCHA.'));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

export const getRecaptchaToken = async (action: string): Promise<string> => {
  const siteKey = ensureSiteKey();

  await loadRecaptchaScript(siteKey);

  if (!window.grecaptcha) {
    throw new Error('reCAPTCHA not available on the page.');
  }

  return new Promise<string>((resolve, reject) => {
    try {
      window.grecaptcha?.ready(() => {
        window.grecaptcha
          ?.execute(siteKey, { action })
          .then((token) => resolve(token))
          .catch((error) => reject(error));
      });
    } catch (error) {
      reject(error);
    }
  });
};
