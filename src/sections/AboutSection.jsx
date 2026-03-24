import Button from '../components/Button';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function AboutSection() {
  return (
    <section className="section about-section" data-header-tone="dark" id="about" aria-labelledby="about-title">
      <div className="section-inner about-grid">
        <Reveal className="about-top-action">
          <p className="about-top-action-label">Chiamaci</p>
          <Button className="about-call-cta" href={restaurant.reservation.phoneHref} variant="secondary">
            <>
              <svg
                aria-hidden="true"
                className="about-call-cta-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.69 4.98a1.75 1.75 0 0 1 1.78-1.08l2.12.24c.67.08 1.22.56 1.42 1.2l.67 2.26c.18.62.01 1.29-.45 1.74l-1.55 1.55a14.6 14.6 0 0 0 4.42 4.42l1.55-1.55c.45-.46 1.12-.63 1.74-.45l2.26.67c.64.2 1.12.75 1.2 1.42l.24 2.12a1.75 1.75 0 0 1-1.08 1.78c-1.36.59-2.91.74-4.36.39-2.41-.58-4.93-2.18-7.11-4.36-2.18-2.18-3.78-4.7-4.36-7.11-.35-1.45-.2-3 .39-4.36Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {restaurant.reservation.phoneCompactLabel}
            </>
          </Button>
        </Reveal>

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
