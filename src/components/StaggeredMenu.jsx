import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { NavLink, useLocation } from 'react-router-dom';
import { restaurant } from '../data/siteContent';
import '../styles/staggered-menu.css';

function StaggeredMenu({
  navigation,
  buttonColor = '#fffaf3',
  openButtonColor = '#241914',
  accentColor = '#b8765f',
  colors = ['#d6b49b', '#bb7f6a', '#f4e7da'],
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const iconRef = useRef(null);
  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const colorTweenRef = useRef(null);
  const iconTweenRef = useRef(null);
  const openRafRef = useRef(null);
  const openRef = useRef(false);
  const visibleRef = useRef(false);

  const resetItemState = useCallback(() => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    const itemLabels = panel.querySelectorAll('.sm-panel-itemLabel');
    const itemRows = panel.querySelectorAll('.sm-panel-item');
    const brand = panel.querySelectorAll('.sm-panel-brand');

    gsap.set(itemLabels, { yPercent: 140, rotate: 9 });
    gsap.set(itemRows, { '--sm-num-opacity': 0 });
    gsap.set(brand, { y: 20, opacity: 0 });
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preLayers = preLayersRef.current?.querySelectorAll('.sm-prelayer') ?? [];

      if (!panel) {
        return;
      }

      gsap.set([panel, ...preLayers], { xPercent: 100 });
      gsap.set(iconRef.current, { rotate: 0, transformOrigin: '50% 50%' });
      gsap.set(toggleBtnRef.current, { color: buttonColor });
      resetItemState();
    }, wrapperRef);

    return () => ctx.revert();
  }, [buttonColor, resetItemState]);

  const animateButtonColor = useCallback(
    (isOpening) => {
      colorTweenRef.current?.kill();
      colorTweenRef.current = gsap.to(toggleBtnRef.current, {
        color: isOpening ? openButtonColor : buttonColor,
        duration: 0.28,
        ease: 'power2.out',
      });
    },
    [buttonColor, openButtonColor],
  );

  const animateIcon = useCallback((isOpening) => {
    iconTweenRef.current?.kill();
    iconTweenRef.current = gsap.to(iconRef.current, {
      rotate: isOpening ? 225 : 0,
      duration: isOpening ? 0.75 : 0.34,
      ease: isOpening ? 'power4.out' : 'power3.inOut',
    });
  }, []);

  const playOpen = useCallback(() => {
    const panel = panelRef.current;
    const preLayers = Array.from(preLayersRef.current?.querySelectorAll('.sm-prelayer') ?? []);

    if (!panel) {
      return;
    }

    openRafRef.current = null;
    openTlRef.current?.kill();
    closeTweenRef.current?.kill();
    resetItemState();

    const itemLabels = panel.querySelectorAll('.sm-panel-itemLabel');
    const itemRows = panel.querySelectorAll('.sm-panel-item');
    const brand = panel.querySelectorAll('.sm-panel-brand');

    const tl = gsap.timeline();

    preLayers.forEach((layer, index) => {
      tl.to(
        layer,
        {
          xPercent: 0,
          duration: 0.52,
          ease: 'power4.out',
        },
        index * 0.07,
      );
    });

    tl.to(
      panel,
      {
        xPercent: 0,
        duration: 0.72,
        ease: 'power4.out',
      },
      preLayers.length ? 0.12 : 0,
    );

    tl.to(
      brand,
      {
        y: 0,
        opacity: 1,
        duration: 0.46,
        ease: 'power3.out',
        stagger: 0.05,
      },
      preLayers.length ? 0.34 : 0.18,
    );

    tl.to(
      itemLabels,
      {
        yPercent: 0,
        rotate: 0,
        duration: 0.95,
        ease: 'power4.out',
        stagger: 0.085,
      },
      preLayers.length ? 0.4 : 0.22,
    );

    tl.to(
      itemRows,
      {
        duration: 0.58,
        ease: 'power2.out',
        '--sm-num-opacity': 1,
        stagger: 0.06,
      },
      preLayers.length ? 0.52 : 0.34,
    );

    openTlRef.current = tl;
  }, [resetItemState]);

  const playClose = useCallback(() => {
    const panel = panelRef.current;
    const preLayers = Array.from(preLayersRef.current?.querySelectorAll('.sm-prelayer') ?? []);

    if (!panel) {
      return;
    }

    if (openRafRef.current) {
      window.cancelAnimationFrame(openRafRef.current);
      openRafRef.current = null;
    }

    openTlRef.current?.kill();
    closeTweenRef.current?.kill();

    closeTweenRef.current = gsap.to([panel, ...preLayers], {
      xPercent: 100,
      duration: 0.34,
      ease: 'power3.in',
      onComplete: () => {
        resetItemState();
        visibleRef.current = false;
        setIsVisible(false);
      },
    });
  }, [resetItemState]);

  const closeMenu = useCallback(() => {
    if (!openRef.current && !visibleRef.current) {
      return;
    }

    openRef.current = false;
    setOpen(false);

    if (openRafRef.current) {
      window.cancelAnimationFrame(openRafRef.current);
      openRafRef.current = null;
      openTlRef.current?.kill();
      closeTweenRef.current?.kill();
      visibleRef.current = false;
      setIsVisible(false);
      resetItemState();
      animateIcon(false);
      animateButtonColor(false);
      return;
    }

    playClose();
    animateIcon(false);
    animateButtonColor(false);
  }, [animateButtonColor, animateIcon, playClose, resetItemState]);

  const toggleMenu = useCallback(() => {
    if (openRef.current) {
      closeMenu();
      return;
    }

    openRef.current = true;
    visibleRef.current = true;
    setIsVisible(true);
    setOpen(true);
    animateIcon(true);
    animateButtonColor(true);

    if (openRafRef.current) {
      window.cancelAnimationFrame(openRafRef.current);
    }

    openRafRef.current = window.requestAnimationFrame(() => {
      if (openRef.current) {
        playOpen();
      }
    });
  }, [animateButtonColor, animateIcon, closeMenu, playOpen]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', isVisible);

    return () => document.body.classList.remove('menu-open');
  }, [isVisible]);

  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960 && openRef.current) {
        closeMenu();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu]);

  useEffect(
    () => () => {
      if (openRafRef.current) {
        window.cancelAnimationFrame(openRafRef.current);
      }
    },
    [],
  );

  const menuItems = [...navigation, { label: 'Prenota', href: '#reservation' }];

  return (
    <div
      ref={wrapperRef}
      className={`staggered-menu-shell ${isVisible ? 'is-open' : ''}`}
      style={{ '--sm-accent': accentColor }}
    >
      <button
        ref={toggleBtnRef}
        className="sm-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="staggered-menu-panel"
        aria-label={open ? 'Chiudi il menu' : 'Apri il menu'}
        onClick={toggleMenu}
      >
        <span className="sm-toggle-label">{open ? 'Chiudi' : 'Menu'}</span>
        <span ref={iconRef} className="sm-toggle-icon" aria-hidden="true">
          <span className="sm-toggle-line" />
          <span className="sm-toggle-line sm-toggle-line-v" />
        </span>
      </button>

      <div ref={preLayersRef} className="sm-prelayers" aria-hidden="true">
        {colors.map((color, index) => (
          <span key={color + index} className="sm-prelayer" style={{ background: color }} />
        ))}
      </div>

      <aside
        id="staggered-menu-panel"
        ref={panelRef}
        className="staggered-menu-panel"
        aria-hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Menu mobile"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeMenu();
          }
        }}
      >
        <div className="sm-panel-inner">
          <div className="sm-panel-head">
            <p className="sm-panel-brand">{restaurant.name}</p>
          </div>

          <nav className="sm-panel-nav" aria-label="Navigazione mobile">
            <ul className="sm-panel-list" data-numbering role="list">
              {menuItems.map((item, index) => (
                <li key={item.label + index} className="sm-panel-itemWrap">
                  {item.to ? (
                    <NavLink
                      className={({ isActive }) => `sm-panel-item ${isActive ? 'is-active' : ''}`}
                      end={item.to === '/'}
                      to={item.to}
                      onClick={closeMenu}
                      viewTransition
                    >
                      <span className="sm-panel-itemLabel">{item.label}</span>
                    </NavLink>
                  ) : (
                    <a className="sm-panel-item" href={item.href} onClick={closeMenu}>
                      <span className="sm-panel-itemLabel">{item.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
}

export default StaggeredMenu;
