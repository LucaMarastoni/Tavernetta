import { useEffect, useRef, useState } from 'react';

const SWIPE_THRESHOLD = 48;

function HeroCarousel({ slides, autoPlayDelay = 7600 }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(null);

  const totalSlides = slides.length;

  const goToNext = () => {
    setCurrentIndex((current) => (current + 1) % totalSlides);
  };

  const goToPrevious = () => {
    setCurrentIndex((current) => (current - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (totalSlides <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(goToNext, autoPlayDelay);

    return () => window.clearInterval(intervalId);
  }, [autoPlayDelay, totalSlides]);

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) {
      return;
    }

    const touchEndX = event.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX.current;

    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta < 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
  };

  return (
    <div
      className="hero-carousel"
      onTouchEnd={handleTouchEnd}
      onTouchStart={handleTouchStart}
    >
      <p className="sr-only" aria-live="polite">
        Immagine {currentIndex + 1} di {totalSlides}
      </p>

      {slides.map((slide, index) => (
        <div
          key={slide.src}
          className={`hero-slide ${index === currentIndex ? 'is-active' : ''}`}
          aria-hidden={index !== currentIndex}
        >
          <img
            alt={slide.alt}
            className="hero-slide-image"
            decoding="async"
            fetchPriority={index === 0 ? 'high' : 'auto'}
            loading={index === 0 ? 'eager' : 'lazy'}
            src={slide.src}
          />
        </div>
      ))}

      <div className="hero-wash" />
    </div>
  );
}

export default HeroCarousel;
