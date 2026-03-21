import Button from '../components/Button';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function AboutSection() {
  return (
    <section className="section about-section" data-header-tone="dark" id="about" aria-labelledby="about-title">
      <div className="section-inner about-grid">
        <Reveal className="about-visual">
          <span aria-hidden="true" className="section-ornament about-orbit" />
          <span aria-hidden="true" className="section-ornament about-block" />
          <div className="image-card about-image-card">
            <img
              alt={restaurant.about.image.alt}
              className="section-image"
              decoding="async"
              loading="lazy"
              src={restaurant.about.image.src}
            />
          </div>
        </Reveal>

        <Reveal className="about-copy about-copy-minimal" delay={120} direction="left">
          <SectionTitle
            eyebrow={restaurant.about.eyebrow}
            id="about-title"
            title={restaurant.about.title}
          />

          <Button className="editorial-link-button" to={restaurant.about.cta.to} variant="ghost-dark">
            {restaurant.about.cta.label}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export default AboutSection;
