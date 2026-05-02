import { formatAllergenList } from '../../utils/allergens';
import { formatPrice } from '../../utils/formatPrice';

function MenuManager({
  categories,
  items,
  filters,
  summary,
  onFilterChange,
  onCreatePizza,
  onEditPizza,
  onDeletePizza,
}) {
  return (
    <section className="admin-section admin-surface" aria-labelledby="admin-menu-manager-title">
      <div className="admin-section-head">
        <div>
          <p className="admin-kicker">Menu</p>
          <h2 id="admin-menu-manager-title">Gestione menu</h2>
          <p className="admin-section-intro">Aggiorna la carta in modo rapido: filtri, ricerca, modifica e inserimento nuove pizze.</p>
        </div>

        <button className="admin-primary-button" type="button" onClick={onCreatePizza}>
          Aggiungi pizza
        </button>
      </div>

      <div className="admin-toolbar">
        <label className="admin-field">
          <span>Cerca</span>
          <input
            type="search"
            placeholder="Nome pizza o ingrediente"
            value={filters.search}
            onChange={(event) => onFilterChange('search', event.target.value)}
          />
        </label>

        <label className="admin-field">
          <span>Categoria</span>
          <select value={filters.categoryId} onChange={(event) => onFilterChange('categoryId', event.target.value)}>
            <option value="all">Tutte le categorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-field">
          <span>Ordina per</span>
          <select value={filters.sortBy} onChange={(event) => onFilterChange('sortBy', event.target.value)}>
            <option value="name-asc">Nome A-Z</option>
            <option value="price-asc">Prezzo crescente</option>
            <option value="price-desc">Prezzo decrescente</option>
            <option value="category-asc">Categoria</option>
          </select>
        </label>
      </div>

      <div className="admin-toggle-row" role="group" aria-label="Filtri rapidi">
        <button
          className={`admin-toggle-chip ${filters.spicyOnly ? 'is-active' : ''}`}
          type="button"
          aria-pressed={filters.spicyOnly}
          onClick={() => onFilterChange('spicyOnly', !filters.spicyOnly)}
        >
          Solo piccanti
        </button>

        <button
          className={`admin-toggle-chip ${filters.vegetarianOnly ? 'is-active' : ''}`}
          type="button"
          aria-pressed={filters.vegetarianOnly}
          onClick={() => onFilterChange('vegetarianOnly', !filters.vegetarianOnly)}
        >
          Solo vegetariane
        </button>
      </div>

      <div className="admin-results-meta">
        <span className="admin-results-item">
          <strong>{summary.visibleCount}</strong>
          <small>{summary.visibleCount === 1 ? 'pizza visibile' : 'pizze visibili'}</small>
        </span>
        <span className="admin-results-item">
          <strong>{summary.categoryCount}</strong>
          <small>{summary.categoryCount === 1 ? 'categoria' : 'categorie'}</small>
        </span>
        {summary.activeFilterCount ? (
          <span className="admin-results-item">
            <strong>{summary.activeFilterCount}</strong>
            <small>{summary.activeFilterCount === 1 ? 'filtro attivo' : 'filtri attivi'}</small>
          </span>
        ) : null}
        {summary.totalCount !== summary.visibleCount ? (
          <span className="admin-results-item is-muted">
            <small>{`su ${summary.totalCount} pizze totali`}</small>
          </span>
        ) : null}
      </div>

      <div className="admin-menu-list" role="list">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="admin-menu-row" role="listitem">
              <div className="admin-menu-row-main">
                <div className="admin-menu-row-head">
                  <div>
                    <p className="admin-menu-row-category">{item.categoryName}</p>
                    <h3>{item.name}</h3>
                  </div>

                  <div className="admin-badge-row">
                    {item.spicy ? <span className="admin-inline-badge is-accent">Piccante</span> : null}
                    {item.vegetarian ? <span className="admin-inline-badge">Vegetariana</span> : null}
                  </div>
                </div>

                <p className="admin-menu-row-ingredients">
                  {item.ingredients.length ? item.ingredients.join(', ') : 'Ingredienti non indicati'}
                </p>

                <div className="admin-menu-row-meta">
                  <span>
                    {item.allergens.length ? `Allergeni: ${formatAllergenList(item.allergens)}` : 'Senza allergeni indicati'}
                  </span>
                  {item.note ? <span>Nota: {item.note}</span> : null}
                </div>
              </div>

              <div className="admin-menu-row-side">
                <strong>{formatPrice(item.price)}</strong>

                <div className="admin-row-actions">
                  <button className="admin-secondary-button" type="button" onClick={() => onEditPizza(item)}>
                    Modifica
                  </button>
                  <button className="admin-danger-button" type="button" onClick={() => onDeletePizza(item)}>
                    Rimuovi
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="admin-empty-state">
            <h3>Nessuna pizza trovata</h3>
            <p>Prova a cambiare filtri o aggiungi una nuova voce locale per testare l’interfaccia.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default MenuManager;
