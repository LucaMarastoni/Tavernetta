import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function TeamSection({ content = restaurant.team }) {
  return (
    <section className="section team-section" data-header-tone="dark" id="team" aria-labelledby="team-title">
      <div className="section-inner team-grid">
        <Reveal className="team-visual">
          <span aria-hidden="true" className="section-ornament team-arc" />
          <span aria-hidden="true" className="section-ornament team-disc" />
          <div className="image-card team-image-card">
            <img
              alt={content.image.alt}
              className="section-image"
              decoding="async"
              loading="lazy"
              src={content.image.src}
            />
          </div>
        </Reveal>

        <Reveal className="team-copy team-copy-minimal" delay={120} direction="left">
          <SectionTitle
            eyebrow={content.eyebrow}
            id="team-title"
            title={content.title}
          />

          <p className="team-quote-minimal">{content.quote}</p>

          <div className="team-highlights team-highlights-minimal">
            {content.highlights.map((highlight) => (
              <article key={highlight.label} className="team-highlight-card">
                <p>{highlight.label}</p>
                <h3>{highlight.value}</h3>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default TeamSection;
