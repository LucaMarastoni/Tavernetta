import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

function FlowingMenu({
  items = [],
  speed = 15,
  textColor = 'var(--color-espresso)',
  bgColor = 'transparent',
  marqueeBgColor = 'var(--color-espresso)',
  marqueeTextColor = 'var(--color-shell)',
  borderColor = 'rgba(61, 43, 33, 0.12)',
}) {
  return (
    <div className="flowing-menu" style={{ backgroundColor: bgColor }}>
      <nav className="flowing-menu-nav" aria-label="Categorie del menu">
        {items.map((item) => (
          <FlowingMenuItem
            key={item.text}
            {...item}
            borderColor={borderColor}
            marqueeBgColor={marqueeBgColor}
            marqueeTextColor={marqueeTextColor}
            speed={speed}
            textColor={textColor}
          />
        ))}
      </nav>
    </div>
  );
}

function FlowingMenuItem({
  link,
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor,
}) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: 'expo.out' };

  const distMetric = (x, y, x2, y2) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const clearRevealTweens = () => {
    if (!marqueeRef.current || !marqueeInnerRef.current) {
      return;
    }

    gsap.killTweensOf(marqueeRef.current, 'yPercent');
    gsap.killTweensOf(marqueeInnerRef.current, 'yPercent');
  };

  const openMarquee = (edge) => {
    if (!marqueeRef.current || !marqueeInnerRef.current) {
      return;
    }

    clearRevealTweens();

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { yPercent: edge === 'top' ? -101 : 101 }, 0)
      .set(marqueeInnerRef.current, { yPercent: edge === 'top' ? 101 : -101 }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { yPercent: 0 }, 0);
  };

  const closeMarquee = (edge) => {
    if (!marqueeRef.current || !marqueeInnerRef.current) {
      return;
    }

    clearRevealTweens();

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { yPercent: edge === 'top' ? -101 : 101 }, 0)
      .to(marqueeInnerRef.current, { yPercent: edge === 'top' ? 101 : -101 }, 0);
  };

  useEffect(() => {
    if (!marqueeRef.current || !marqueeInnerRef.current) {
      return undefined;
    }

    gsap.set(marqueeRef.current, { yPercent: 101 });
    gsap.set(marqueeInnerRef.current, { x: 0, yPercent: -101 });

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) {
        return;
      }

      const marqueeContent = marqueeInnerRef.current.querySelector('.flowing-menu__marquee-part');

      if (!marqueeContent) {
        return;
      }

      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;

      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);

    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [image, text]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) {
        return;
      }

      const marqueeContent = marqueeInnerRef.current.querySelector('.flowing-menu__marquee-part');

      if (!marqueeContent) {
        return;
      }

      const contentWidth = marqueeContent.offsetWidth;

      if (contentWidth === 0) {
        return;
      }

      if (animationRef.current) {
        animationRef.current.kill();
      }

      gsap.set(marqueeInnerRef.current, { x: 0 });

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: 'none',
        repeat: -1,
      });
    };

    const timer = window.setTimeout(setupMarquee, 50);

    return () => {
      window.clearTimeout(timer);

      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [image, repetitions, speed, text]);

  const handleMouseEnter = (event) => {
    if (!itemRef.current) {
      return;
    }

    const rect = itemRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    openMarquee(edge);
  };

  const handleMouseLeave = (event) => {
    if (!itemRef.current) {
      return;
    }

    const rect = itemRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    closeMarquee(edge);
  };

  return (
    <div className="flowing-menu__item" ref={itemRef} style={{ borderColor }}>
      <Link
        className="flowing-menu__item-link"
        onBlur={() => closeMarquee('top')}
        onFocus={() => openMarquee('bottom')}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ color: textColor }}
        to={link}
        viewTransition
      >
        <span className="flowing-menu__item-text">{text}</span>
      </Link>

      <div className="flowing-menu__marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="flowing-menu__marquee-inner-wrap">
          <div className="flowing-menu__marquee-inner" ref={marqueeInnerRef} aria-hidden="true">
            {Array.from({ length: repetitions }).map((_, index) => (
              <div className="flowing-menu__marquee-part" key={`${text}-${index}`} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                <div className="flowing-menu__marquee-image" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowingMenu;
