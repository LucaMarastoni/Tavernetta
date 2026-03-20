import { NavLink } from 'react-router-dom';
import { restaurant } from '../data/siteContent';

function MobileMenu({ open, navigation, onClose }) {
  return (
    <div className={`mobile-menu-layer ${open ? 'is-open' : ''}`} aria-hidden={!open}>
      <button className="mobile-menu-backdrop" type="button" aria-label="Chiudi il menu" onClick={onClose} />

      <div className="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu mobile">
        <div className="mobile-menu-shell">
          <div className="mobile-menu-topbar">
            <div className="mobile-menu-identity">
              <p className="mobile-menu-brand">{restaurant.name}</p>
              <p className="mobile-menu-tagline">{restaurant.label}</p>
            </div>

            <button className="mobile-close" type="button" onClick={onClose}>
              <span className="mobile-close-icon" aria-hidden="true">
                <span />
                <span />
              </span>
              <span className="mobile-close-label">Chiudi</span>
            </button>
          </div>

          <div className="mobile-menu-main">
            <nav className="mobile-nav" aria-label="Navigazione mobile">
              {navigation.map((item, index) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) => `mobile-link ${isActive ? 'is-active' : ''}`}
                  end={item.to === '/'}
                  style={{ '--item-index': index + 1 }}
                  to={item.to}
                  onClick={onClose}
                  viewTransition
                >
                  <span className="mobile-link-label">{item.label}</span>
                  <span className="mobile-link-mark" aria-hidden="true" />
                </NavLink>
              ))}

              <a
                className="mobile-link mobile-link-cta"
                href="#reservation"
                style={{ '--item-index': navigation.length + 1 }}
                onClick={onClose}
              >
                <span className="mobile-link-label">Prenota</span>
                <span className="mobile-link-mark" aria-hidden="true" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileMenu;
