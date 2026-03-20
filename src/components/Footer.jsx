import { restaurant } from '../data/siteContent';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-inner footer-inner">
        <div>
          <p className="footer-brand">{restaurant.name}</p>
          <p className="footer-note">
            {restaurant.location} . {restaurant.label}
          </p>
        </div>

        <p className="footer-copy">
          Copyright {new Date().getFullYear()} {restaurant.name}. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
