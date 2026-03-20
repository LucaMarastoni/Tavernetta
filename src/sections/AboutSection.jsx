import Button from '../components/Button';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function AboutSection() {
  return (
    <section className="section about-section" id="about" aria-labelledby="about-title">
      <div className="section-inner about-grid">
        <Reveal className="about-copy">
          <SectionTitle
            eyebrow={restaurant.about.eyebrow}
            id="about-title"
            intro={restaurant.about.intro}
            title={restaurant.about.title}
          />

          <div className="rich-text">
            {restaurant.about.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="about-metrics">
            {restaurant.about.metrics.map((metric) => (
              <div key={metric.label} className="metric-card">
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>

          <Button to={restaurant.about.cta.to} variant="secondary">
            {restaurant.about.cta.label}
          </Button>
        </Reveal>

        <Reveal className="about-visual" delay={120} direction="left">
          <div className="image-card">
            <img
              alt={restaurant.about.image.alt}
              className="section-image"
              decoding="async"
              loading="lazy"
              src={restaurant.about.image.src}
            />
          </div>

          <div className="about-note-card">
            <p>{restaurant.about.note}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default AboutSection;
