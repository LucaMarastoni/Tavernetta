export const CONSENT_STORAGE_KEY = 'tavernetta-cookie-consent-v1';
export const CONSENT_VERSION = 1;

export const DEFAULT_COOKIE_PREFERENCES = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export const COOKIE_CATEGORIES = [
  {
    key: 'necessary',
    title: 'Necessari',
    description:
      'Permettono il funzionamento essenziale del sito, la sicurezza di base, la memorizzazione del carrello e delle preferenze indispensabili.',
    required: true,
  },
  {
    key: 'analytics',
    title: 'Analitici',
    description:
      'Aiutano a capire come viene usato il sito in forma aggregata, cosi da migliorare contenuti, navigazione e prestazioni.',
    required: false,
  },
  {
    key: 'marketing',
    title: 'Marketing',
    description:
      'Abilitano servizi di terze parti e contenuti esterni che possono profilare o tracciare l utente, come mappe incorporate o futuri strumenti promozionali.',
    required: false,
  },
];

export function normalizeCookiePreferences(value = {}) {
  return {
    necessary: true,
    analytics: Boolean(value.analytics),
    marketing: Boolean(value.marketing),
  };
}

export function normalizeStoredConsent(value = {}) {
  const preferences = normalizeCookiePreferences(value);

  return {
    ...preferences,
    version: CONSENT_VERSION,
    method: typeof value.method === 'string' ? value.method : 'custom',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  };
}

export function readStoredConsent() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(CONSENT_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue);

    if (!parsedValue || parsedValue.version !== CONSENT_VERSION) {
      return null;
    }

    return normalizeStoredConsent(parsedValue);
  } catch {
    return null;
  }
}

export function writeStoredConsent(consent) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(normalizeStoredConsent(consent)));
}

export function clearStoredConsent() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(CONSENT_STORAGE_KEY);
}
