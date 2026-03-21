import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function PhilosophySection({ content = restaurant.philosophy }) {
  return (
    <section
      className="section philosophy-section"
      data-header-tone="light"
      id="philosophy"
      aria-labelledby="philosophy-title"
    >
      <div className="section-inner philosophy-grid">
        <Reveal className="philosophy-visual">
          <span aria-hidden="true" className="section-ornament philosophy-curve" />
          <span aria-hidden="true" className="section-ornament philosophy-disc" />
          <div className="image-card philosophy-image-card">
            <img
              alt={content.image.alt}
              className="section-image"
              decoding="async"
              loading="lazy"
              src={content.image.src}
            />
          </div>
        </Reveal>

        <Reveal className="philosophy-copy philosophy-copy-minimal" delay={120} direction="left">
          <SectionTitle
            eyebrow={content.eyebrow}
            id="philosophy-title"
            title={content.title}
            tone="light"
          />

          <div className="philosophy-card philosophy-card-minimal">
            <div className="philosophy-pillars philosophy-pillars-minimal">
              {content.pillars.map((pillar) => (
                <article key={pillar.title} className="philosophy-pillar">
                  <h3>{pillar.title}</h3>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default PhilosophySection;
