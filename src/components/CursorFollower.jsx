import { useEffect, useRef, useState } from 'react';

const INTERACTIVE_SELECTOR = 'a, button, [data-cursor="interactive"]';

function CursorFollower() {
  const cursorRef = useRef(null);
  const frameRef = useRef(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updateAvailability = () => {
      const available = finePointerQuery.matches && !reduceMotionQuery.matches;
      setIsEnabled(available);
      document.body.classList.toggle('cursor-enhanced', available);
    };

    updateAvailability();

    finePointerQuery.addEventListener('change', updateAvailability);
    reduceMotionQuery.addEventListener('change', updateAvailability);

    return () => {
      finePointerQuery.removeEventListener('change', updateAvailability);
      reduceMotionQuery.removeEventListener('change', updateAvailability);
      document.body.classList.remove('cursor-enhanced');
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      setIsVisible(false);
      return undefined;
    }

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.16;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.16;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentRef.current.x}px, ${currentRef.current.y}px, 0)`;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const handleMove = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY };

      if (!isVisible) {
        currentRef.current = { x: event.clientX, y: event.clientY };
        setIsVisible(true);
      }

      setIsInteractive(Boolean(event.target.closest(INTERACTIVE_SELECTOR)));
    };

    const handleLeave = () => {
      setIsVisible(false);
      setIsInteractive(false);
      setIsPressed(false);
    };

    const handleWindowOut = (event) => {
      if (!event.relatedTarget) {
        handleLeave();
      }
    };

    const handleDown = () => setIsPressed(true);
    const handleUp = () => setIsPressed(false);

    frameRef.current = window.requestAnimationFrame(animate);
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseout', handleWindowOut);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseout', handleWindowOut);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isEnabled, isVisible]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className={`cursor-follower ${isVisible ? 'is-visible' : ''} ${isInteractive ? 'is-interactive' : ''} ${
        isPressed ? 'is-pressed' : ''
      }`}
      aria-hidden="true"
    >
      <span className="cursor-follower-ring" />
      <span className="cursor-follower-dot" />
    </div>
  );
}

export default CursorFollower;
