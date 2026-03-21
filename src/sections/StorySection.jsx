import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function StorySection({ content = restaurant.story }) {
  return (
    <section
      className="section story-section"
      data-header-tone="dark"
      id="story"
      aria-labelledby="story-title"
    >
      <div className="section-inner story-grid">
        <Reveal className="story-visual">
          <span aria-hidden="true" className="section-ornament story-orbit" />
          <span aria-hidden="true" className="section-ornament story-slab" />
          <div className="image-card story-image-card">
            <img
              alt={content.image.alt}
              className="section-image"
              decoding="async"
              loading="lazy"
              src={content.image.src}
            />
          </div>
        </Reveal>

        <Reveal className="story-copy story-copy-minimal" delay={120} direction="left">
          <SectionTitle
            eyebrow={content.eyebrow}
            id="story-title"
            title={content.title}
          />

          <p className="story-lead">{content.intro}</p>

          <div className="story-details story-details-minimal">
            {content.details.map((detail) => (
              <article key={detail.label} className="story-detail-card">
                <p>{detail.label}</p>
                <h3>{detail.value}</h3>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default StorySection;
