import Button from '../components/Button';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { previewCategories, restaurant } from '../data/siteContent';

function MenuPreviewSection() {
  return (
    <section
      className="section preview-section"
      data-header-tone="dark"
      id="menu-preview"
      aria-labelledby="menu-preview-title"
    >
      <div className="section-inner">
        <div className="preview-layout">
          <Reveal className="preview-visual">
            <span aria-hidden="true" className="section-ornament preview-arch" />
            <span aria-hidden="true" className="section-ornament preview-outline" />
            <div className="image-card preview-image-card">
              <img
                alt={restaurant.preview.image.alt}
                className="section-image"
                decoding="async"
                loading="lazy"
                src={restaurant.preview.image.src}
              />
            </div>
          </Reveal>

          <Reveal className="preview-intro-block preview-intro-block-minimal" direction="left">
            <SectionTitle
              eyebrow={restaurant.preview.eyebrow}
              id="menu-preview-title"
              title={restaurant.preview.title}
            />

            <div className="preview-list">
              {previewCategories.map((category, index) => (
                <Reveal
                  key={category.title}
                  as="article"
                  className="preview-row"
                  delay={index * 70}
                  direction="left"
                >
                  <span className="preview-index">{category.index}</span>

                  <div className="preview-copy">
                    <h3>{category.title}</h3>
                  </div>

                  <span className="preview-price">Da {category.price}</span>
                </Reveal>
              ))}
            </div>

            <div className="preview-actions preview-actions-minimal">
              <Button className="editorial-link-button" to={restaurant.preview.cta.to} variant="ghost-dark">
                {restaurant.preview.cta.label}
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default MenuPreviewSection;
