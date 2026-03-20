import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import { menuCategories, restaurant } from '../data/siteContent';

function FullMenuSection({ compact = false }) {
  return (
    <section
      className={`section full-menu-section ${compact ? 'is-compact' : ''}`}
      id="menu"
      aria-labelledby="menu-title"
    >
      <div className="section-inner">
        {compact ? (
          <h2 className="sr-only" id="menu-title">
            {restaurant.menu.title}
          </h2>
        ) : (
          <Reveal>
            <SectionTitle
              eyebrow={restaurant.menu.eyebrow}
              id="menu-title"
              intro={restaurant.menu.intro}
              title={restaurant.menu.title}
            />
          </Reveal>
        )}

        <div className="menu-layout">
          <Reveal as="aside" className="menu-sidebar" direction="right">
            <p className="menu-sidebar-label">Scorri la selezione</p>
            <nav className="menu-chip-nav" aria-label="Categorie del menu">
              {menuCategories.map((category) => (
                <a key={category.id} className="menu-chip-link" href={`#menu-${category.id}`}>
                  {category.name}
                </a>
              ))}
            </nav>
          </Reveal>

          <div className="menu-content">
            {menuCategories.map((category, index) => (
              <Reveal
                key={category.id}
                as="section"
                className="menu-category"
                delay={index * 50}
                id={`menu-${category.id}`}
              >
                <div className="menu-category-header">
                  <div>
                    <p className="menu-category-note">{category.note}</p>
                    <h3>{category.name}</h3>
                  </div>

                  {category.description ? (
                    <p className="menu-category-description">{category.description}</p>
                  ) : null}
                </div>

                <div className="menu-items">
                  {category.items.map((item) => (
                    <article key={item.name} className="menu-item">
                      <div className="menu-item-top">
                        <h4>{item.name}</h4>
                        <span className="menu-item-price">{item.price}</span>
                      </div>

                      <p className="menu-item-description">{item.description}</p>

                      {item.allergens ? (
                        <p className="menu-item-allergens">Allergeni: {item.allergens}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FullMenuSection;
