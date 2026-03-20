import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function TeamSection() {
  return (
    <section className="section team-section" id="team" aria-labelledby="team-title">
      <div className="section-inner team-grid">
        <Reveal className="team-visual" direction="right">
          <div className="image-card team-image-card">
            <img
              alt={restaurant.team.image.alt}
              className="section-image"
              decoding="async"
              loading="lazy"
              src={restaurant.team.image.src}
            />
          </div>
        </Reveal>

        <Reveal className="team-copy" delay={120}>
          <SectionTitle
            eyebrow={restaurant.team.eyebrow}
            id="team-title"
            intro={restaurant.team.quote}
            title={restaurant.team.title}
          />

          <div className="rich-text">
            {restaurant.team.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="team-highlights">
            {restaurant.team.highlights.map((highlight) => (
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
