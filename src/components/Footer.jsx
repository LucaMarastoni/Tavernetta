import { Link } from 'react-router-dom';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { restaurant } from '../data/siteContent';

function Footer() {
  const { openPreferences } = useCookieConsent();

  return (
    <footer className="site-footer">
      <div className="section-inner footer-inner">
        <div>
          <p className="footer-brand">{restaurant.name}</p>
          <p className="footer-note">
            {restaurant.location} . {restaurant.label}
          </p>
        </div>

        <div className="footer-legal">
          <div className="footer-legal-links">
            <Link to="/privacy-policy" viewTransition>
              Privacy Policy
            </Link>
            <Link to="/cookie-policy" viewTransition>
              Cookie Policy
            </Link>
            <button type="button" onClick={openPreferences}>
              Gestisci cookie
            </button>
          </div>

          <p className="footer-copy">
            Copyright {new Date().getFullYear()} {restaurant.name}. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
