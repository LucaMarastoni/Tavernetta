import { Link } from 'react-router-dom';
import { useCookieConsent } from '../../hooks/useCookieConsent';

function CookieBanner() {
  const { acceptAll, rejectAll, isBannerVisible, openPreferences } = useCookieConsent();

  if (!isBannerVisible) {
    return null;
  }

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-labelledby="cookie-banner-title">
      <div className="cookie-banner-copy">
        <p className="cookie-banner-eyebrow">Privacy</p>
        <h2 id="cookie-banner-title">Usiamo solo cio che serve, e il resto lo scegli tu.</h2>
        <p className="cookie-banner-summary">
          I cookie necessari restano attivi per carrello, sicurezza e preferenze essenziali. I cookie analitici e di
          marketing si attivano solo con il tuo consenso.
        </p>
        <p className="cookie-banner-links cookie-banner-detail">
          Approfondisci in <Link to="/privacy-policy" viewTransition>Privacy Policy</Link> e{' '}
          <Link to="/cookie-policy" viewTransition>Cookie Policy</Link>.
        </p>
      </div>

      <div className="cookie-banner-actions">
        <button className="cookie-button cookie-button-ghost" type="button" onClick={rejectAll}>
          Rifiuta tutto
        </button>
        <button className="cookie-button cookie-button-secondary" type="button" onClick={openPreferences}>
          Gestisci preferenze
        </button>
        <button className="cookie-button cookie-button-primary" type="button" onClick={acceptAll}>
          Accetta tutto
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;
