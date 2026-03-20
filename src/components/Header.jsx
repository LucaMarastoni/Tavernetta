import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { restaurant } from '../data/siteContent';
import Button from './Button';
import MobileMenu from './MobileMenu';

function Header({ navigation }) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const isSolid = !isHome || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', isMenuOpen);

    return () => document.body.classList.remove('menu-open');
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className={`site-header ${isSolid ? 'is-solid' : ''}`}>
        <div className="section-inner header-inner">
          <NavLink className="brand" to="/" onClick={closeMenu} viewTransition>
            <span className="brand-copy">
              <span className="brand-name">{restaurant.name}</span>
              <span className="brand-subtitle">
                {restaurant.location} . {restaurant.label}
              </span>
            </span>
          </NavLink>

          <nav className="site-nav" aria-label="Navigazione principale">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
                end={item.to === '/'}
                to={item.to}
                viewTransition
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            <Button className="header-cta" href="#reservation" size="small" variant="ghost">
              Prenota
            </Button>

            <button
              className={`menu-toggle ${isMenuOpen ? 'is-open' : ''}`}
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? 'Chiudi il menu' : 'Apri il menu'}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu navigation={navigation} onClose={closeMenu} open={isMenuOpen} />
    </>
  );
}

export default Header;
