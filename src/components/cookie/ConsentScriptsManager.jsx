import { useEffect } from 'react';
import { useCookieConsent } from '../../hooks/useCookieConsent';

const ANALYTICS_SCRIPT_ID = 'tavernetta-ga-script';
const ANALYTICS_BOOTSTRAP_ID = 'tavernetta-ga-bootstrap';

function loadGoogleAnalytics(measurementId) {
  if (document.getElementById(ANALYTICS_SCRIPT_ID)) {
    return;
  }

  window[`ga-disable-${measurementId}`] = false;
  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  const script = document.createElement('script');
  script.id = ANALYTICS_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;

  const bootstrap = document.createElement('script');
  bootstrap.id = ANALYTICS_BOOTSTRAP_ID;
  bootstrap.text = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${measurementId}', { anonymize_ip: true });
  `;

  document.head.appendChild(script);
  document.head.appendChild(bootstrap);
}

function unloadGoogleAnalytics(measurementId) {
  window[`ga-disable-${measurementId}`] = true;
  document.getElementById(ANALYTICS_SCRIPT_ID)?.remove();
  document.getElementById(ANALYTICS_BOOTSTRAP_ID)?.remove();
}

const OPTIONAL_SERVICES = {
  analytics: [
    {
      key: 'google-analytics',
      isEnabled: () => Boolean(import.meta.env.VITE_GA_MEASUREMENT_ID?.trim()),
      load: () => loadGoogleAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID.trim()),
      unload: () => unloadGoogleAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID.trim()),
    },
  ],
  marketing: [],
};

function ConsentScriptsManager() {
  const { preferences } = useCookieConsent();

  useEffect(() => {
    Object.entries(OPTIONAL_SERVICES).forEach(([category, services]) => {
      services.forEach((service) => {
        if (!service.isEnabled()) {
          return;
        }

        if (preferences[category]) {
          service.load();
          return;
        }

        service.unload();
      });
    });

    return undefined;
  }, [preferences.analytics, preferences.marketing]);

  return null;
}

export default ConsentScriptsManager;
