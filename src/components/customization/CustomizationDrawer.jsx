import { useEffect, useMemo, useState } from 'react';
import QuantityControl from '../QuantityControl';
import ProductOptionsGroup from './ProductOptionsGroup';
import { createCartLine } from '../../utils/cart';
import { formatPrice } from '../../utils/formatPrice';
import { calculateConfiguredUnitPrice } from '../../utils/pricing';

function getDefaultSelectionsForGroup(group) {
  if (group.selectionType === 'multiple') {
    return group.options.filter((option) => option.isDefault).map((option) => option.id);
  }

  const explicitDefault = group.options.find((option) => option.isDefault);

  if (explicitDefault) {
    return [explicitDefault.id];
  }

  if (group.required && group.minSelections > 0 && group.options[0]) {
    return [group.options[0].id];
  }

  return [];
}

function getDefaultOptionSelections(optionGroups) {
  return optionGroups.flatMap(getDefaultSelectionsForGroup);
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

function getSelectedOptionIdsForGroup(group, selectedOptionIds) {
  const groupOptionIds = new Set(group.options.map((option) => option.id));
  return selectedOptionIds.filter((optionId) => groupOptionIds.has(optionId));
}

function getSelectedOptions(configuration, selectedOptionIds) {
  if (!configuration) {
    return [];
  }

  return configuration.optionGroups.flatMap((group) =>
    group.options
      .filter((option) => selectedOptionIds.includes(option.id))
      .map((option) => ({
        ...option,
        groupName: group.name,
        groupSlug: group.slug,
      })),
  );
}

function getMissingGroups(configuration, selectedOptionIds) {
  if (!configuration) {
    return [];
  }

  return configuration.optionGroups.filter((group) => {
    const selectedCount = getSelectedOptionIdsForGroup(group, selectedOptionIds).length;
    return selectedCount < group.minSelections;
  });
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

  const selectedOptions = useMemo(
    () => getSelectedOptions(configuration, state.selectedOptionIds),
    [configuration, state.selectedOptionIds],
  );

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

  const missingGroups = useMemo(
    () => getMissingGroups(configuration, state.selectedOptionIds),
    [configuration, state.selectedOptionIds],
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

  const totalPrice = useMemo(() => finalUnitPrice * state.quantity, [finalUnitPrice, state.quantity]);
  const confirmDisabled = Boolean(loading || error || !configuration || missingGroups.length);
  const confirmLabel = initialLine
    ? `Aggiorna ${state.quantity} per ${formatPrice(totalPrice)}`
    : `Aggiungi ${state.quantity} per ${formatPrice(totalPrice)}`;

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

  const toggleOption = (group, optionId) => {
    setState((currentState) => {
      const groupSelections = getSelectedOptionIdsForGroup(group, currentState.selectedOptionIds);
      const isSelected = groupSelections.includes(optionId);

      let nextGroupSelections = groupSelections;

      if (group.selectionType === 'single') {
        if (isSelected && group.minSelections === 0) {
          nextGroupSelections = [];
        } else {
          nextGroupSelections = [optionId];
        }
      } else if (isSelected) {
        nextGroupSelections = groupSelections.filter((entry) => entry !== optionId);
      } else if (groupSelections.length < group.maxSelections) {
        nextGroupSelections = [...groupSelections, optionId];
      } else {
        return currentState;
      }

      const groupOptionIds = new Set(group.options.map((option) => option.id));

      return {
        ...currentState,
        selectedOptionIds: [
          ...currentState.selectedOptionIds.filter((entry) => !groupOptionIds.has(entry)),
          ...nextGroupSelections,
        ],
      };
    });
  };

  const handleConfirm = () => {
    if (!configuration || confirmDisabled) {
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
    <div className="menu-product-sheet" role="dialog" aria-modal="true" aria-labelledby="customization-title">
      <button className="menu-product-sheet-backdrop" type="button" aria-label="Chiudi personalizzazione" onClick={onClose} />

      <aside className="menu-product-sheet-panel">
        <div className="menu-product-sheet-scroll">
          <div className={`menu-product-sheet-hero ${configuration?.item.imageUrl ? '' : 'is-placeholder'}`}>
            {configuration?.item.imageUrl ? (
              <img
                alt={configuration?.item.name ?? 'Prodotto'}
                loading="lazy"
                decoding="async"
                src={configuration.item.imageUrl}
              />
            ) : (
              <div className="menu-product-sheet-placeholder" aria-hidden="true">
                <span>{configuration?.item.name?.charAt(0) ?? 'T'}</span>
              </div>
            )}

            <div className="menu-product-sheet-hero-bar">
              {initialLine ? <span className="menu-product-sheet-mode">Modifica prodotto</span> : <span aria-hidden="true" />}

              <button className="menu-product-sheet-close" type="button" onClick={onClose}>
                Chiudi
              </button>
            </div>
          </div>

          <div className="menu-product-sheet-header">
            {initialLine ? <p className="ordering-eyebrow">Rivedi la configurazione</p> : null}

            <div className="menu-product-sheet-title-row">
              <h2 id="customization-title">{configuration?.item.name ?? 'Prodotto'}</h2>
              {configuration ? <strong>{formatPrice(configuration.item.basePrice)}</strong> : null}
            </div>

            <p className="menu-product-sheet-description">
              {configuration?.item.description ?? 'Stiamo caricando il dettaglio del prodotto.'}
            </p>
          </div>

          {loading ? <p className="menu-product-sheet-status">Stiamo preparando ingredienti, varianti e note disponibili.</p> : null}
          {error ? <p className="menu-product-sheet-status is-error">{error}</p> : null}

          {!loading && !error && configuration ? (
            <div className="menu-product-sheet-body">
              {configuration.defaultIngredients.length ? (
                <section className="menu-product-section-block">
                  <div className="menu-product-section-head">
                    <div>
                      <h3>Ingredienti di base</h3>
                    </div>
                    <span>{formatPrice(configuration.item.basePrice)}</span>
                  </div>

                  <div className="menu-product-ingredient-list">
                    {configuration.defaultIngredients.map((ingredient) => {
                      const isRemoved = state.removedIngredientIds.includes(ingredient.ingredientId);

                      return (
                        <button
                          key={ingredient.ingredientId}
                          className={`menu-product-ingredient ${ingredient.isRemovable ? '' : 'is-locked'} ${isRemoved ? 'is-removed' : ''}`.trim()}
                          type="button"
                          onClick={() => ingredient.isRemovable && toggleRemovedIngredient(ingredient.ingredientId)}
                          disabled={!ingredient.isRemovable}
                        >
                          <span>{ingredient.name}</span>
                          <small>{ingredient.isRemovable ? (isRemoved ? 'Rimosso' : 'Tocca per togliere') : 'Sempre incluso'}</small>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              {configuration.optionGroups.map((group) => (
                <ProductOptionsGroup
                  key={group.slug}
                  group={group}
                  selectedOptionIds={getSelectedOptionIdsForGroup(group, state.selectedOptionIds)}
                  onToggle={toggleOption}
                />
              ))}

              {configuration.allowedExtras.length ? (
                <section className="menu-product-section-block">
                  <div className="menu-product-section-head">
                    <div>
                      <h3>Aggiungi extra</h3>
                      <p>Ogni extra viene calcolato sul singolo prodotto.</p>
                    </div>
                    <span>Facoltativi</span>
                  </div>

                  <div className="menu-product-extra-list">
                    {configuration.allowedExtras.map((extra) => {
                      const isActive = state.addedExtraIds.includes(extra.id);

                      return (
                        <button
                          key={extra.id}
                          className={`menu-product-extra ${isActive ? 'is-active' : ''}`}
                          type="button"
                          aria-pressed={isActive}
                          onClick={() => toggleExtra(extra.id)}
                        >
                          <div className="menu-product-extra-copy">
                            <strong>{extra.name}</strong>
                            {extra.allergenInfo ? <small>{extra.allergenInfo}</small> : null}
                          </div>

                          <span>{extra.extraPrice ? `+ ${formatPrice(extra.extraPrice)}` : 'Incluso'}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ) : null}

              <section className="menu-product-section-block">
                <div className="menu-product-section-head">
                  <div>
                    <h3>Note per la cucina</h3>
                  </div>
                </div>

                <textarea
                  className="menu-product-note-field"
                  rows="3"
                  placeholder="Es. taglio in 6, cottura leggermente piu asciutta"
                  value={state.note}
                  onChange={(event) => setState((currentState) => ({ ...currentState, note: event.target.value }))}
                />
              </section>
            </div>
          ) : null}
        </div>

        {!loading && !error && configuration ? (
          <div className="menu-product-sheet-footer">
            {missingGroups.length ? (
              <p className="menu-product-sheet-footer-note is-warning">
                {`Completa "${missingGroups[0].name}" per continuare.`}
              </p>
            ) : null}

            <div className="menu-product-sheet-footer-main">
              <QuantityControl
                value={state.quantity}
                onDecrease={() =>
                  setState((currentState) => ({ ...currentState, quantity: Math.max(1, currentState.quantity - 1) }))
                }
                onIncrease={() => setState((currentState) => ({ ...currentState, quantity: currentState.quantity + 1 }))}
              />

              <button className="ordering-primary-cta menu-product-sheet-submit" type="button" disabled={confirmDisabled} onClick={handleConfirm}>
                {confirmLabel}
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

export default CustomizationDrawer;
