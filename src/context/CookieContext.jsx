import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_COOKIE_PREFERENCES,
  normalizeCookiePreferences,
  normalizeStoredConsent,
  readStoredConsent,
  writeStoredConsent,
} from '../utils/consentStorage';

const CookieContext = createContext(null);

export function CookieProvider({ children }) {
  const [storedConsent, setStoredConsent] = useState(readStoredConsent);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    if (isPreferencesOpen) {
      document.body.classList.add('cookie-modal-open');
    } else {
      document.body.classList.remove('cookie-modal-open');
    }

    return () => {
      document.body.classList.remove('cookie-modal-open');
    };
  }, [isPreferencesOpen]);

  const saveConsent = (preferences, method = 'custom') => {
    const nextConsent = normalizeStoredConsent({
      ...preferences,
      method,
      updatedAt: new Date().toISOString(),
    });

    setStoredConsent(nextConsent);
    writeStoredConsent(nextConsent);
    setIsPreferencesOpen(false);
  };

  const value = useMemo(
    () => ({
      consent: storedConsent,
      preferences: storedConsent ? normalizeCookiePreferences(storedConsent) : DEFAULT_COOKIE_PREFERENCES,
      hasMadeChoice: Boolean(storedConsent),
      isPreferencesOpen,
      isBannerVisible: !storedConsent && !isPreferencesOpen,
      acceptAll: () =>
        saveConsent(
          {
            necessary: true,
            analytics: true,
            marketing: true,
          },
          'accept_all',
        ),
      rejectAll: () =>
        saveConsent(
          {
            necessary: true,
            analytics: false,
            marketing: false,
          },
          'reject_all',
        ),
      savePreferences: (preferences) => saveConsent(preferences, 'custom'),
      openPreferences: () => setIsPreferencesOpen(true),
      closePreferences: () => setIsPreferencesOpen(false),
    }),
    [isPreferencesOpen, storedConsent],
  );

  return <CookieContext.Provider value={value}>{children}</CookieContext.Provider>;
}

export function useCookieContext() {
  const context = useContext(CookieContext);

  if (!context) {
    throw new Error('useCookieContext deve essere usato all interno di CookieProvider.');
  }

  return context;
}
