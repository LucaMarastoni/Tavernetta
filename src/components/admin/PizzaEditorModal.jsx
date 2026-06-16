import { useEffect, useMemo, useState } from 'react';
import { buildPizzaFormState } from '../../data/adminMenu';

const WINE_CATEGORY_OPTIONS = [
  { key: 'white', label: 'Bianchi', categoryName: 'Vini Bianchi' },
  { key: 'rose', label: 'Rose', categoryName: 'Vini Rose' },
  { key: 'red', label: 'Rossi', categoryName: 'Vini Rossi' },
];

function normalizeComparableText(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function parsePrice(value) {
  const price = Number.parseFloat(String(value ?? '').replace(',', '.'));
  return Number.isFinite(price) ? price : null;
}

function PizzaEditorModal({
  open,
  mode,
  pizza,
  categories,
  allergenOptions,
  loadingFlags = false,
  saving = false,
  statusMessage = '',
  onClose,
  onSave,
}) {
  const [formState, setFormState] = useState(buildPizzaFormState(pizza));

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormState(buildPizzaFormState(pizza));
  }, [open, pizza]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const canSubmit = useMemo(() => {
    const name = formState.name.trim();
    const categoryName = formState.categoryName.trim();
    const price = parsePrice(formState.price);

    return Boolean(name && categoryName && price !== null && price >= 0);
  }, [formState]);

  if (!open) {
    return null;
  }

  const selectedWineCategory = WINE_CATEGORY_OPTIONS.find(
    (option) => normalizeComparableText(option.categoryName) === normalizeComparableText(formState.categoryName),
  );

  const toggleAllergen = (code) => {
    setFormState((currentState) => ({
      ...currentState,
      allergens: currentState.allergens.includes(code)
        ? currentState.allergens.filter((entry) => entry !== code)
        : [...currentState.allergens, code].sort((left, right) => left - right),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    onSave({
      id: formState.id,
      name: formState.name.trim(),
      categoryName: formState.categoryName.trim(),
      price: parsePrice(formState.price),
      ingredients: formState.ingredients
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean),
      allergens: formState.allergens,
      spicy: formState.spicy,
      vegetarian: formState.vegetarian,
      imagePath: formState.imagePath.trim(),
      active: formState.active,
      note: formState.note.trim(),
    });
  };

  return (
    <div className="admin-modal-root" role="dialog" aria-modal="true" aria-labelledby="pizza-editor-title">
      <button className="admin-modal-backdrop" type="button" aria-label="Chiudi editor pizza" onClick={onClose} />

      <div className="admin-modal-panel admin-editor-modal">
        <form className="admin-modal-content" onSubmit={handleSubmit}>
          <div className="admin-modal-head">
            <div>
              <p className="admin-kicker">Menu editor</p>
              <h2 id="pizza-editor-title">{mode === 'create' ? 'Nuova pizza' : 'Modifica pizza'}</h2>
            </div>

            <button className="admin-ghost-button" type="button" onClick={onClose}>
              Chiudi
            </button>
          </div>

          <div className="admin-editor-grid">
            {loadingFlags || statusMessage ? (
              <div className="admin-order-status-error admin-field-wide" role={statusMessage ? 'alert' : 'status'}>
                {loadingFlags ? 'Carico i dati della pizza...' : statusMessage}
              </div>
            ) : null}

            <label className="admin-field">
              <span>Nome</span>
              <input
                type="text"
                value={formState.name}
                onChange={(event) => setFormState((currentState) => ({ ...currentState, name: event.target.value }))}
              />
            </label>

            <label className="admin-field">
              <span>Prezzo</span>
              <input
                type="text"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={formState.price}
                onChange={(event) => setFormState((currentState) => ({ ...currentState, price: event.target.value }))}
              />
            </label>

            <label className="admin-field admin-field-wide">
              <span>Categoria</span>
              <input
                list="admin-category-options"
                type="text"
                value={formState.categoryName}
                onChange={(event) => setFormState((currentState) => ({ ...currentState, categoryName: event.target.value }))}
              />
              <datalist id="admin-category-options">
                {categories.map((category) => (
                  <option key={category.id} value={category.name} />
                ))}
              </datalist>
            </label>

            <fieldset className="admin-fieldset admin-fieldset-wide">
              <legend>Tipologia vino</legend>
              <div className="admin-toggle-row" role="group" aria-label="Tipologia vino">
                {WINE_CATEGORY_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    className={`admin-toggle-chip ${selectedWineCategory?.key === option.key ? 'is-active' : ''}`}
                    type="button"
                    aria-pressed={selectedWineCategory?.key === option.key}
                    onClick={() =>
                      setFormState((currentState) => ({ ...currentState, categoryName: option.categoryName }))
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="admin-field admin-field-wide">
              <span>Ingredienti</span>
              <textarea
                rows="4"
                placeholder="pomodoro, mozzarella, basilico"
                value={formState.ingredients}
                onChange={(event) => setFormState((currentState) => ({ ...currentState, ingredients: event.target.value }))}
              />
            </label>

            <label className="admin-field admin-field-wide">
              <span>Percorso immagine</span>
              <input
                type="text"
                placeholder="/images/pizze/margherita.jpeg"
                value={formState.imagePath}
                onChange={(event) => setFormState((currentState) => ({ ...currentState, imagePath: event.target.value }))}
              />
            </label>

            <fieldset className="admin-fieldset">
              <legend>Segnalazioni</legend>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={formState.active}
                  onChange={(event) => setFormState((currentState) => ({ ...currentState, active: event.target.checked }))}
                />
                <span>Attivo</span>
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={formState.spicy}
                  onChange={(event) => setFormState((currentState) => ({ ...currentState, spicy: event.target.checked }))}
                />
                <span>Piccante</span>
              </label>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={formState.vegetarian}
                  onChange={(event) =>
                    setFormState((currentState) => ({ ...currentState, vegetarian: event.target.checked }))
                  }
                />
                <span>Vegetariana</span>
              </label>
            </fieldset>

            <fieldset className="admin-fieldset admin-fieldset-wide">
              <legend>Allergeni</legend>
              <div className="admin-allergen-grid">
                {allergenOptions.map((option) => (
                  <label key={option.code} className="admin-check">
                    <input
                      type="checkbox"
                      checked={formState.allergens.includes(option.code)}
                      onChange={() => toggleAllergen(option.code)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="admin-field admin-field-wide">
              <span>Note</span>
              <textarea
                rows="3"
                placeholder="Indicazioni interne o nota di menu"
                value={formState.note}
                onChange={(event) => setFormState((currentState) => ({ ...currentState, note: event.target.value }))}
              />
            </label>
          </div>

          <div className="admin-modal-actions">
            <button className="admin-secondary-button" type="button" onClick={onClose}>
              Annulla
            </button>
            <button className="admin-primary-button" type="submit" disabled={!canSubmit || saving || loadingFlags}>
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PizzaEditorModal;
