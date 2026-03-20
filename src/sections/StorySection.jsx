import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { restaurant } from '../data/siteContent';

function StorySection() {
  return (
    <section className="section story-section" aria-labelledby="story-title">
      <div className="section-inner story-grid">
        <Reveal className="story-visual" direction="right">
          <div className="image-card story-image-card">
            <img
              alt={restaurant.story.image.alt}
              className="section-image"
              decoding="async"
              loading="lazy"
              src={restaurant.story.image.src}
            />
          </div>
        </Reveal>

        <Reveal className="story-copy" delay={120}>
          <SectionTitle
            eyebrow={restaurant.story.eyebrow}
            id="story-title"
            intro={restaurant.story.intro}
            title={restaurant.story.title}
          />

          <div className="rich-text">
            {restaurant.story.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <div className="story-details">
            {restaurant.story.details.map((detail) => (
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
