import { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '../../utils/formatPrice';

function ExtraIngredientsPanel({ ingredients, loading, error, savingId, onRetry, onSave }) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [priceValue, setPriceValue] = useState('');

  const filteredIngredients = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('it');

    if (!normalizedSearch) {
      return ingredients;
    }

    return ingredients.filter((ingredient) => ingredient.name.toLocaleLowerCase('it').includes(normalizedSearch));
  }, [ingredients, search]);

  useEffect(() => {
    if (editingId && !ingredients.some((ingredient) => ingredient.id === editingId)) {
      setEditingId(null);
      setPriceValue('');
    }
  }, [editingId, ingredients]);

  const startEditing = (ingredient) => {
    setEditingId(ingredient.id);
    setPriceValue(String(ingredient.extraPrice).replace('.', ','));
  };

  const stopEditing = () => {
    setEditingId(null);
    setPriceValue('');
  };

  const handleSave = async (event, ingredient) => {
    event.preventDefault();

    try {
      await onSave(ingredient, priceValue);
      stopEditing();
    } catch {
      // Il messaggio viene mostrato dal pannello; manteniamo aperto l'editor per correggere o riprovare.
    }
  };

  return (
    <section className="admin-section admin-surface" aria-labelledby="admin-extra-ingredients-title">
      <div className="admin-section-head">
        <div>
          <p className="admin-kicker">Personalizzazioni</p>
          <h2 id="admin-extra-ingredients-title">Ingredienti aggiuntivi</h2>
          <p className="admin-section-intro">
            Modifica il supplemento applicato quando un cliente aggiunge un ingrediente alla pizza.
          </p>
        </div>

        <span className="admin-status-pill">
          {ingredients.length === 1 ? '1 ingrediente' : `${ingredients.length} ingredienti`}
        </span>
      </div>

      {error ? (
        <div className="admin-order-status-error admin-extra-error" role="alert">
          <span>{error}</span>
          <button className="admin-secondary-button" type="button" onClick={onRetry}>
            Riprova
          </button>
        </div>
      ) : null}

      {!loading && ingredients.length ? (
        <label className="admin-field admin-extra-search">
          <span>Cerca ingrediente</span>
          <input
            type="search"
            placeholder="Es. mozzarella"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      ) : null}

      {loading ? (
        <div className="admin-empty-state">
          <h3>Caricamento ingredienti</h3>
          <p>Leggo i supplementi configurati.</p>
        </div>
      ) : null}

      {!loading && ingredients.length ? (
        <div className="admin-extra-list" role="list">
          {filteredIngredients.map((ingredient) => {
            const isEditing = editingId === ingredient.id;
            const isSaving = savingId === ingredient.id;

            return (
              <article key={ingredient.id} className="admin-extra-row" role="listitem">
                <div className="admin-extra-row-main">
                  <h3>{ingredient.name}</h3>
                  <p>Prezzo aggiuntivo</p>
                </div>

                {isEditing ? (
                  <form className="admin-extra-price-editor" onSubmit={(event) => handleSave(event, ingredient)}>
                    <label className="admin-field admin-extra-price-field">
                      <span className="sr-only">Nuovo prezzo per {ingredient.name}</span>
                      <span className="admin-extra-currency" aria-hidden="true">
                        €
                      </span>
                      <input
                        autoFocus
                        inputMode="decimal"
                        min="0"
                        name="extraPrice"
                        required
                        step="0.01"
                        type="number"
                        value={priceValue.replace(',', '.')}
                        onChange={(event) => setPriceValue(event.target.value)}
                      />
                    </label>

                    <div className="admin-row-actions">
                      <button className="admin-secondary-button" type="button" disabled={isSaving} onClick={stopEditing}>
                        Annulla
                      </button>
                      <button className="admin-primary-button" type="submit" disabled={isSaving}>
                        {isSaving ? 'Salvataggio...' : 'Salva'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="admin-extra-row-side">
                    <strong>{formatPrice(ingredient.extraPrice)}</strong>
                    <button
                      className="admin-secondary-button"
                      type="button"
                      disabled={Boolean(savingId)}
                      onClick={() => startEditing(ingredient)}
                    >
                      Modifica
                    </button>
                  </div>
                )}
              </article>
            );
          })}

          {!filteredIngredients.length ? (
            <div className="admin-empty-state">
              <h3>Nessun ingrediente trovato</h3>
              <p>Prova con un nome diverso.</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && !ingredients.length && !error ? (
        <div className="admin-empty-state">
          <h3>Nessun ingrediente aggiuntivo</h3>
          <p>Non risultano supplementi configurati nel menu.</p>
        </div>
      ) : null}
    </section>
  );
}

export default ExtraIngredientsPanel;
