import { useEffect, useRef, useState } from 'react';

function Reveal({
  as: Tag = 'div',
  children,
  className = '',
  direction = 'up',
  delay = 0,
  ...rest
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const node = elementRef.current;

    if (mediaQuery.matches || !node) {
      setIsVisible(true);
      return undefined;
    }

    if (typeof window.IntersectionObserver !== 'function') {
      setIsVisible(true);
      return undefined;
    }

    const revealImmediately = () => {
      setIsVisible(true);
    };

    const bounds = node.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;

    if (bounds.top <= viewportHeight * 0.92) {
      const frameId = window.requestAnimationFrame(revealImmediately);

      return () => window.cancelAnimationFrame(frameId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -24px 0px',
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={elementRef}
      className={`reveal reveal-${direction} ${isVisible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
