import { useEffect, useMemo, useState } from 'react';
import QuantityControl from '../QuantityControl';
import { createCartLine } from '../../utils/cart';
import { formatPrice } from '../../utils/formatPrice';
import { calculateConfiguredUnitPrice } from '../../utils/pricing';

function getDefaultOptionSelections(optionGroups) {
  return optionGroups
    .map((group) => group.options.find((option) => option.isDefault)?.id ?? group.options[0]?.id ?? null)
    .filter(Boolean);
}

function createInitialState(configuration, initialLine) {
  if (!configuration) {
    return {
      removedIngredientIds: [],
      addedExtraIds: [],
      selectedOptionIds: [],
      quantity: 1,
      note: '',
    };
  }

  if (initialLine) {
    return {
      removedIngredientIds: initialLine.customization?.removedIngredientIds ?? [],
      addedExtraIds: initialLine.customization?.addedExtraIds ?? [],
      selectedOptionIds:
        initialLine.customization?.selectedOptionIds?.length
          ? initialLine.customization.selectedOptionIds
          : getDefaultOptionSelections(configuration.optionGroups),
      quantity: initialLine.quantity,
      note: initialLine.note || '',
    };
  }

  return {
    removedIngredientIds: [],
    addedExtraIds: [],
    selectedOptionIds: getDefaultOptionSelections(configuration.optionGroups),
    quantity: 1,
    note: '',
  };
}

function CustomizationDrawer({ open, loading, error, configuration, initialLine, onClose, onConfirm }) {
  const [state, setState] = useState(createInitialState(configuration, initialLine));

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    document.body.classList.add('menu-open');

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.classList.remove('menu-open');
      window.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setState(createInitialState(configuration, initialLine));
  }, [configuration, initialLine, open]);

  const selectedOptions = useMemo(() => {
    if (!configuration) {
      return [];
    }

    return configuration.optionGroups
      .map((group) => {
        const requestedOption = group.options.find((option) => state.selectedOptionIds.includes(option.id));
        return requestedOption ?? group.options.find((option) => option.isDefault) ?? group.options[0] ?? null;
      })
      .filter(Boolean);
  }, [configuration, state.selectedOptionIds]);

  const removedIngredients = useMemo(
    () =>
      configuration?.removableIngredients.filter((ingredient) => state.removedIngredientIds.includes(ingredient.ingredientId)) ??
      [],
    [configuration, state.removedIngredientIds],
  );

  const addedExtras = useMemo(
    () => configuration?.allowedExtras.filter((extra) => state.addedExtraIds.includes(extra.id)) ?? [],
    [configuration, state.addedExtraIds],
  );

  const finalUnitPrice = useMemo(
    () =>
      configuration
        ? calculateConfiguredUnitPrice({
            basePrice: configuration.item.basePrice,
            selectedOptions,
            addedExtras,
          })
        : 0,
    [addedExtras, configuration, selectedOptions],
  );

  if (!open) {
    return null;
  }

  const toggleRemovedIngredient = (ingredientId) => {
    setState((currentState) => ({
      ...currentState,
      removedIngredientIds: currentState.removedIngredientIds.includes(ingredientId)
        ? currentState.removedIngredientIds.filter((entry) => entry !== ingredientId)
        : [...currentState.removedIngredientIds, ingredientId],
    }));
  };

  const toggleExtra = (extraId) => {
    setState((currentState) => ({
      ...currentState,
      addedExtraIds: currentState.addedExtraIds.includes(extraId)
        ? currentState.addedExtraIds.filter((entry) => entry !== extraId)
        : [...currentState.addedExtraIds, extraId],
    }));
  };

  const selectOption = (groupSlug, optionId) => {
    setState((currentState) => {
      const idsWithoutGroup = currentState.selectedOptionIds.filter((entry) => {
        const group = configuration.optionGroups.find((optionGroup) => optionGroup.slug === groupSlug);
        return !group?.options.some((option) => option.id === entry);
      });

      return {
        ...currentState,
        selectedOptionIds: [...idsWithoutGroup, optionId],
      };
    });
  };

  const handleConfirm = () => {
    if (!configuration) {
      return;
    }

    const nextLine = createCartLine({
      item: configuration.item,
      quantity: state.quantity,
      note: state.note,
      removedIngredients,
      addedExtras,
      selectedOptions,
      basePrice: configuration.item.basePrice,
      finalUnitPrice,
    });

    onConfirm(nextLine, initialLine?.lineId || null);
  };

  return (
    <div className="ordering-drawer-shell" role="dialog" aria-modal="true" aria-labelledby="customization-title">
      <button className="ordering-drawer-backdrop" type="button" aria-label="Chiudi personalizzazione" onClick={onClose} />

      <aside className="ordering-drawer-panel">
        <div className="ordering-drawer-header">
          <div>
            <p className="ordering-eyebrow">{initialLine ? 'Modifica riga' : 'Personalizza'}</p>
            <h2 id="customization-title">{configuration?.item.name ?? 'Prodotto'}</h2>
            <p>{configuration?.item.description ?? 'Stiamo caricando il dettaglio del prodotto.'}</p>
          </div>

          <button className="ordering-drawer-close" type="button" onClick={onClose}>
            Chiudi
          </button>
        </div>

        {loading ? <p className="ordering-drawer-status">Stiamo preparando gli ingredienti e le varianti disponibili.</p> : null}
        {error ? <p className="ordering-drawer-status is-error">{error}</p> : null}

        {!loading && !error && configuration ? (
          <>
            <div className="ordering-drawer-body">
              <section className="ordering-customization-section">
                <div className="ordering-section-heading">
                  <h3>Base della pizza</h3>
                  <span>{formatPrice(configuration.item.basePrice)}</span>
                </div>

                <div className="ordering-ingredient-list">
                  {configuration.defaultIngredients.map((ingredient) => {
                    const isRemoved = state.removedIngredientIds.includes(ingredient.ingredientId);

                    return (
                      <button
                        key={ingredient.ingredientId}
                        className={`ordering-ingredient-pill ${ingredient.isRemovable ? '' : 'is-locked'} ${isRemoved ? 'is-removed' : ''}`.trim()}
                        type="button"
                        onClick={() => ingredient.isRemovable && toggleRemovedIngredient(ingredient.ingredientId)}
                        disabled={!ingredient.isRemovable}
                      >
                        <span>{ingredient.name}</span>
                        <small>{ingredient.isRemovable ? (isRemoved ? 'Rimosso' : 'Incluso') : 'Fisso'}</small>
                      </button>
                    );
                  })}
                </div>
              </section>

              {configuration.optionGroups.length ? (
                <section className="ordering-customization-section">
                  <div className="ordering-section-heading">
                    <h3>Varianti</h3>
                    <span>Scelta guidata</span>
                  </div>

                  <div className="ordering-option-groups">
                    {configuration.optionGroups.map((group) => (
                      <div key={group.slug} className="ordering-option-group">
                        <p>{group.name}</p>
                        <div className="ordering-option-grid">
                          {group.options.map((option) => {
                            const isSelected = selectedOptions.some((selectedOption) => selectedOption.id === option.id);

                            return (
                              <button
                                key={option.id}
                                className={`ordering-option-card ${isSelected ? 'is-selected' : ''}`}
                                type="button"
                                onClick={() => selectOption(group.slug, option.id)}
                              >
                                <span>{option.optionName}</span>
                                <small>{option.priceDelta ? `+ ${formatPrice(option.priceDelta)}` : 'Incluso'}</small>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {configuration.allowedExtras.length ? (
                <section className="ordering-customization-section">
                  <div className="ordering-section-heading">
                    <h3>Aggiungi extra</h3>
                    <span>Prezzo per singola pizza</span>
                  </div>

                  <div className="ordering-extra-list">
                    {configuration.allowedExtras.map((extra) => {
                      const isActive = state.addedExtraIds.includes(extra.id);

                      return (
                        <button
                          key={extra.id}
                          className={`ordering-extra-row ${isActive ? 'is-active' : ''}`}
                          type="button"
                          onClick={() => toggleExtra(extra.id)}
                        >
                          <div>
                            <strong>{extra.name}</strong>
                            {extra.allergenInfo ? <span>{extra.allergenInfo}</span> : null}
                          </div>
                          <small>+ {formatPrice(extra.extraPrice)}</small>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <section className="ordering-customization-section">
                <div className="ordering-section-heading">
                  <h3>Note per la cucina</h3>
                  <span>Facoltative</span>
                </div>

                <textarea
                  className="ordering-note-field"
                  rows="4"
                  placeholder="Es. taglio in 6, cottura leggermente piu asciutta"
                  value={state.note}
                  onChange={(event) => setState((currentState) => ({ ...currentState, note: event.target.value }))}
                />
              </section>
            </div>

            <div className="ordering-drawer-footer">
              <QuantityControl
                value={state.quantity}
                onDecrease={() =>
                  setState((currentState) => ({ ...currentState, quantity: Math.max(1, currentState.quantity - 1) }))
                }
                onIncrease={() => setState((currentState) => ({ ...currentState, quantity: currentState.quantity + 1 }))}
              />

              <div className="ordering-drawer-price">
                <span>Prezzo finale</span>
                <strong>{formatPrice(finalUnitPrice * state.quantity)}</strong>
              </div>

              <button className="ordering-primary-cta" type="button" onClick={handleConfirm}>
                {initialLine ? 'Aggiorna carrello' : 'Aggiungi al carrello'}
              </button>
            </div>
          </>
        ) : null}
      </aside>
    </div>
  );
}

export default CustomizationDrawer;
