import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { restaurant } from '../data/siteContent';
import StaggeredMenu from './StaggeredMenu';

const parseChannel = (value) => Number.parseFloat(value.trim());

const getLuminance = (color) => {
  const match = color.match(/rgba?\(([^)]+)\)/i);

  if (!match) {
    return null;
  }

  const [red = 255, green = 255, blue = 255, alpha = 1] = match[1].split(',').map(parseChannel);

  if (alpha < 0.55) {
    return null;
  }

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const resolveToneFromElement = (element) => {
  if (!element) {
    return 'dark';
  }

  const toneSection = element.closest('[data-header-tone]');

  if (toneSection) {
    return toneSection.getAttribute('data-header-tone') || 'dark';
  }

  let node = element;

  while (node && node !== document.body) {
    const luminance = getLuminance(window.getComputedStyle(node).backgroundColor);

    if (luminance !== null) {
      return luminance < 160 ? 'light' : 'dark';
    }

    node = node.parentElement;
  }

  return 'dark';
};

const getToneFromSections = (x, y) => {
  const toneSections = document.querySelectorAll('[data-header-tone]');

  for (const section of toneSections) {
    if (!(section instanceof HTMLElement)) {
      continue;
    }

    const rect = section.getBoundingClientRect();

    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return section.getAttribute('data-header-tone') || 'dark';
    }
  }

  return null;
};

const getToneAtPoint = (x, y) => {
  const toneFromSection = getToneFromSections(x, y);

  if (toneFromSection) {
    return toneFromSection;
  }

  const elements = document.elementsFromPoint(x, y);

  for (const element of elements) {
    if (
      !(element instanceof Element) ||
      element.closest('.site-header') ||
      element.closest('.staggered-menu-panel') ||
      element.closest('.sm-prelayers') ||
      element.closest('.sm-overlay-close') ||
      element.closest('.cursor-follower')
    ) {
      continue;
    }

    return resolveToneFromElement(element);
  }

  return 'dark';
};

function Header({ navigation }) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [brandTone, setBrandTone] = useState('light');
  const [menuTone, setMenuTone] = useState('light');
  const brandRef = useRef(null);
  const navRef = useRef(null);
  const actionsRef = useRef(null);
  const frameRef = useRef(null);

  const usesEditorialHeader =
    location.pathname === '/' || location.pathname === '/chi-siamo' || location.pathname === '/menu';
  const hidesHeader = location.pathname === '/menu/pizze';
  const isSolid = !usesEditorialHeader || isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateHeaderTones = () => {
      frameRef.current = null;

      if (document.body.classList.contains('menu-open')) {
        setBrandTone('dark');
        setMenuTone('dark');
        return;
      }

      const brandRect = brandRef.current?.getBoundingClientRect();
      const navRect = navRef.current?.getBoundingClientRect();
      const actionsRect = actionsRef.current?.getBoundingClientRect();

      const brandX = Math.round((brandRect?.left ?? 18) + (brandRect?.width ?? 56) / 2);
      const brandY = Math.round((brandRect?.top ?? 18) + (brandRect?.height ?? 24) / 2);
      const menuX = Math.round(
        ((window.innerWidth > 960 ? navRect?.left : actionsRect?.left) ?? window.innerWidth - 72) +
          ((window.innerWidth > 960 ? navRect?.width : actionsRect?.width) ?? 56) / 2,
      );
      const menuY = Math.round(
        ((window.innerWidth > 960 ? navRect?.top : actionsRect?.top) ?? 18) +
          ((window.innerWidth > 960 ? navRect?.height : actionsRect?.height) ?? 24) / 2,
      );

      setBrandTone(getToneAtPoint(brandX, brandY));
      setMenuTone(getToneAtPoint(menuX, menuY));
    };

    const requestUpdate = () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(updateHeaderTones);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);

      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [location.pathname]);

  if (hidesHeader) {
    return null;
  }

  return (
    <header className={`site-header ${isSolid ? 'is-solid' : ''}`}>
      <div className="section-inner header-inner">
        <NavLink ref={brandRef} className={`brand is-tone-${brandTone}`} to="/" viewTransition>
          <span className="brand-copy">
            <span className="brand-name">{restaurant.name}</span>
          </span>
        </NavLink>

        <nav ref={navRef} className={`site-nav is-tone-${menuTone}`} aria-label="Navigazione principale">
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

        <div ref={actionsRef} className={`header-actions is-tone-${menuTone}`}>
          <StaggeredMenu
            buttonColor={menuTone === 'dark' ? '#241914' : '#fffaf3'}
            colors={['#cda68f', '#9e6556', '#f4e8da']}
            navigation={navigation}
            openButtonColor="#241914"
          />
        </div>
      </div>
    </header>
  );
}

export default Header;
