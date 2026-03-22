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
        <div className="section-inner about-page-hero-inner">
          <div className="about-page-hero-copy">
            <h1 className="about-page-hero-title">{restaurant.aboutPage.title}</h1>

            <a className="menu-landing-scroll" href="#story" aria-label="Scorri verso il contenuto">
              <span className="menu-landing-scroll-gif" aria-hidden="true">
                <span className="menu-landing-scroll-dot" />
              </span>
              <span className="menu-landing-scroll-text">{restaurant.aboutPage.scrollLabel}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutPageHeroSection;
