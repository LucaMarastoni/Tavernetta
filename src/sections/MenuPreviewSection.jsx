import Button from '../components/Button';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { previewCategories, restaurant } from '../data/siteContent';

function MenuPreviewSection() {
  return (
    <section className="section preview-section" id="menu-preview" aria-labelledby="menu-preview-title">
      <div className="section-inner">
        <div className="preview-layout">
          <Reveal className="preview-intro-block">
            <SectionTitle
              eyebrow={restaurant.preview.eyebrow}
              id="menu-preview-title"
              intro={restaurant.preview.intro}
              title={restaurant.preview.title}
            />

            <div className="preview-actions">
              <Button to={restaurant.preview.cta.to} variant="secondary">
                {restaurant.preview.cta.label}
              </Button>
            </div>
          </Reveal>

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
                  <p>{category.description}</p>
                </div>

                <span className="preview-price">Da {category.price}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MenuPreviewSection;
