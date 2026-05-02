import MenuCatalogSkeleton from '../components/MenuCatalogSkeleton';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import StatusPanel from '../components/StatusPanel';
import { restaurant } from '../data/siteContent';
import { formatAllergenList } from '../utils/allergens';
import { formatPrice } from '../utils/formatPrice';

function FullMenuSection({ compact = false, categories = [], loading = false, error = '', onRetry }) {
  return (
    <section
      className={`section full-menu-section ${compact ? 'is-compact' : ''}`}
      data-header-tone="dark"
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

        {loading ? <MenuCatalogSkeleton /> : null}

        {!loading && error ? (
          <div className="menu-state-shell">
            <StatusPanel
              actionLabel="Riprova"
              message={error}
              onAction={onRetry}
              title="La carta non e disponibile in questo momento."
              tone="error"
            />
          </div>
        ) : null}

        {!loading && !error && categories.length === 0 ? (
          <div className="menu-state-shell">
            <StatusPanel
              message="Non ci sono ancora proposte disponibili nella carta online."
              title="La carta e momentaneamente vuota."
            />
          </div>
        ) : null}

        {!loading && !error && categories.length > 0 ? (
          <div className="menu-layout">
            {compact ? (
              <aside className="menu-sidebar">
                <p className="menu-sidebar-label">Scorri la selezione</p>
                <nav className="menu-chip-nav" aria-label="Categorie del menu">
                  {categories.map((category) => (
                    <a key={category.id} className="menu-chip-link" href={`#menu-${category.slug}`}>
                      {category.name}
                    </a>
                  ))}
                </nav>
              </aside>
            ) : (
              <Reveal as="aside" className="menu-sidebar" direction="right">
                <p className="menu-sidebar-label">Scorri la selezione</p>
                <nav className="menu-chip-nav" aria-label="Categorie del menu">
                  {categories.map((category) => (
                    <a key={category.id} className="menu-chip-link" href={`#menu-${category.slug}`}>
                      {category.name}
                    </a>
                  ))}
                </nav>
              </Reveal>
            )}

            <div className="menu-content">
              {categories.map((category, index) => (
                compact ? (
                  <section key={category.id} className="menu-category" id={`menu-${category.slug}`}>
                    <div className="menu-category-header">
                      <div>
                        <p className="menu-category-note">{category.items.length} proposte disponibili</p>
                        <h3>{category.name}</h3>
                      </div>
                    </div>

                    <div className="menu-items">
                      {category.items.map((item) => (
                        <article key={item.id} className="menu-item">
                          <div className="menu-item-top">
                            <h4>{item.name}</h4>
                            <span className="menu-item-price">{formatPrice(item.price)}</span>
                          </div>

                          <p className="menu-item-description">{item.description}</p>

                          <div className="menu-item-meta">
                            {item.tags.length ? (
                              <div className="menu-tag-list" aria-label="Tag del piatto">
                                {item.tags.map((tag) => (
                                  <span key={tag} className="menu-tag">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            {item.allergens.length ? (
                              <p className="menu-item-allergens">Allergeni: {formatAllergenList(item.allergens)}</p>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : (
                  <Reveal
                    key={category.id}
                    as="section"
                    className="menu-category"
                    delay={index * 50}
                    id={`menu-${category.slug}`}
                  >
                    <div className="menu-category-header">
                      <div>
                        <p className="menu-category-note">{category.items.length} proposte disponibili</p>
                        <h3>{category.name}</h3>
                      </div>
                    </div>

                    <div className="menu-items">
                      {category.items.map((item) => (
                        <article key={item.id} className="menu-item">
                          <div className="menu-item-top">
                            <h4>{item.name}</h4>
                            <span className="menu-item-price">{formatPrice(item.price)}</span>
                          </div>

                          <p className="menu-item-description">{item.description}</p>

                          <div className="menu-item-meta">
                            {item.tags.length ? (
                              <div className="menu-tag-list" aria-label="Tag del piatto">
                                {item.tags.map((tag) => (
                                  <span key={tag} className="menu-tag">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            {item.allergens.length ? (
                              <p className="menu-item-allergens">Allergeni: {formatAllergenList(item.allergens)}</p>
                            ) : null}
                          </div>
                        </article>
                      ))}
                    </div>
                  </Reveal>
                )
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default FullMenuSection;
