import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function PhilosophySection() {
  return (
    <section className="section philosophy-section" id="philosophy" aria-labelledby="philosophy-title">
      <div className="section-inner philosophy-grid">
        <Reveal className="philosophy-copy">
          <SectionTitle
            eyebrow={restaurant.philosophy.eyebrow}
            id="philosophy-title"
            intro={restaurant.philosophy.intro}
            title={restaurant.philosophy.title}
            tone="light"
          />

          <div className="rich-text rich-text-light">
            {restaurant.philosophy.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal className="philosophy-side" delay={120} direction="left">
          <div className="philosophy-card">
            <p className="philosophy-quote">{restaurant.philosophy.quote}</p>

            <div className="philosophy-pillars">
              {restaurant.philosophy.pillars.map((pillar) => (
                <article key={pillar.title} className="philosophy-pillar">
                  <h3>{pillar.title}</h3>
                  <p>{pillar.description}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="image-card philosophy-image-card">
            <img
              alt={restaurant.philosophy.image.alt}
              className="section-image"
              decoding="async"
              loading="lazy"
              src={restaurant.philosophy.image.src}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default PhilosophySection;
