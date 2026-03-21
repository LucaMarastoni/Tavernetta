import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { galleryItems, restaurant } from '../data/siteContent';

function GallerySection() {
  return (
    <section
      className="section gallery-section"
      data-header-tone="dark"
      id="gallery"
      aria-labelledby="gallery-title"
    >
      <div className="section-inner">
        <Reveal>
          <SectionTitle
            align="center"
            eyebrow={restaurant.gallery.eyebrow}
            id="gallery-title"
            title={restaurant.gallery.title}
          />
        </Reveal>

        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <Reveal
              key={item.title}
              as="figure"
              className={`gallery-card gallery-card-${index + 1} ${item.layout}`}
              delay={index * 70}
            >
              <img
                alt={item.image.alt}
                className="gallery-image"
                decoding="async"
                loading="lazy"
                src={item.image.src}
              />
              <figcaption className="gallery-caption">
                <h3>{item.title}</h3>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default GallerySection;
