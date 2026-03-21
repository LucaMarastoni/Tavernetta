import HeroCarousel from '../components/HeroCarousel';
import { aboutPageSlides, restaurant } from '../data/siteContent';

function AboutPageHeroSection() {
  return (
    <section
      className="about-page-hero-section"
      data-header-tone="light"
      id="about-page-top"
      aria-label={`Introduzione di ${restaurant.name}`}
    >
      <HeroCarousel autoPlayDelay={8200} slides={aboutPageSlides} />

      <div className="about-page-hero-chrome">
        <div className="about-page-hero-copy">
          <p className="section-eyebrow">{restaurant.aboutPage.eyebrow}</p>
          <h1 className="about-page-hero-title">{restaurant.aboutPage.title}</h1>
        </div>

        <a className="scroll-indicator" href="#story">
          {restaurant.aboutPage.scrollLabel}
        </a>
      </div>
    </section>
  );
}

export default AboutPageHeroSection;
