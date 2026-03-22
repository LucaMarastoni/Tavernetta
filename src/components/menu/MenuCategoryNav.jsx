function MenuCategoryNav({ categories, activeCategoryId, onSelect }) {
  return (
    <section className="ordering-category-nav-shell" aria-label="Categorie del menu">
      <div className="ordering-category-nav-head">
        <p className="ordering-category-nav-kicker">Carta</p>
        <span className="ordering-category-nav-note">Scorri e scegli la categoria</span>
      </div>

      <nav className="ordering-category-nav" aria-label="Categorie del menu">
        {categories.map((category, index) => (
          <button
            key={category.id}
            className={`ordering-category-chip ${activeCategoryId === category.id ? 'is-active' : ''}`}
            type="button"
            onClick={() => onSelect(category.id)}
          >
            <small className="ordering-category-chip-index">{String(index + 1).padStart(2, '0')}</small>
            <span>{category.name}</span>
            <strong>{category.items.length} proposte</strong>
          </button>
        ))}
      </nav>
    </section>
  );
}

export default MenuCategoryNav;
