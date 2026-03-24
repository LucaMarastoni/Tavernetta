import MenuItemCard from './MenuItemCard';

function MenuProductSection({ group, setSectionRef, onSelectProduct }) {
  const hasMultipleCategories = group.categories.length > 1;

  return (
    <section
      id={`menu-group-${group.id}`}
      ref={setSectionRef}
      className="menu-catalog-section"
      data-group-id={group.id}
      aria-labelledby={`menu-group-title-${group.id}`}
    >
      <header className="menu-catalog-section-head">
        <div className="menu-catalog-section-copy">
          <h2 id={`menu-group-title-${group.id}`}>{group.title}</h2>
          <p>{group.description}</p>
        </div>
      </header>

      <div className="menu-catalog-section-body">
        {group.categories.map((category) => (
          <section key={category.id} className="menu-catalog-subsection">
            {hasMultipleCategories ? (
              <div className="menu-catalog-subsection-head">
                <h3>{category.name}</h3>
              </div>
            ) : null}

            <div className="menu-catalog-list">
              {category.items.map((item) => (
                <MenuItemCard key={item.id} item={item} onSelect={onSelectProduct} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export default MenuProductSection;
