import { assert, normalizeIdentifierList } from '../utils/validators.js';
import { getMenuItemCustomization } from './menuService.js';

export const DELIVERY_FEE = 5;

export function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function selectOptions(optionGroups, selectedOptionIds) {
  const requestedIds = new Set(normalizeIdentifierList(selectedOptionIds));
  const selectedOptions = [];

  optionGroups.forEach((group) => {
    const selectedInGroup = group.options.filter((option) => requestedIds.has(String(option.id)));

    selectedInGroup.forEach((option) => {
      requestedIds.delete(String(option.id));
    });

    const defaultSelections =
      group.selectionType === 'multiple'
        ? group.options.filter((option) => option.isDefault)
        : group.options.find((option) => option.isDefault)
          ? [group.options.find((option) => option.isDefault)]
          : [];

    const fallbackSelections =
      !defaultSelections.length && group.required && group.minSelections > 0 ? group.options.slice(0, group.minSelections) : defaultSelections;

    const resolvedSelections = selectedInGroup.length ? selectedInGroup : fallbackSelections;
    const maxSelections = group.selectionType === 'single' ? 1 : group.maxSelections ?? group.options.length;
    const minSelections = group.minSelections ?? 0;

    assert(
      group.selectionType !== 'single' || resolvedSelections.length <= 1,
      400,
      'INVALID_OPTION_SELECTION',
      'Le opzioni selezionate non sono valide per questo prodotto.',
    );
    assert(
      resolvedSelections.length >= minSelections,
      400,
      'INVALID_OPTION_SELECTION',
      'Le opzioni selezionate non sono valide per questo prodotto.',
    );
    assert(
      resolvedSelections.length <= maxSelections,
      400,
      'INVALID_OPTION_SELECTION',
      'Le opzioni selezionate non sono valide per questo prodotto.',
    );

    resolvedSelections.forEach((option) => {
      selectedOptions.push({
        ...option,
        groupName: option.groupName ?? group.name,
        groupSlug: option.groupSlug ?? group.slug,
      });
    });
  });

  assert(
    requestedIds.size === 0,
    400,
    'INVALID_OPTION_SELECTION',
    'Le opzioni selezionate non sono valide per questo prodotto.',
  );

  return selectedOptions;
}

export async function resolveMenuItemPricing(menuItemId, customization = {}) {
  const configuration = await getMenuItemCustomization(menuItemId);
  const removedIngredientIds = normalizeIdentifierList(customization.removedIngredientIds);
  const addedExtraIds = normalizeIdentifierList(customization.addedExtraIds);
  const selectedOptionIds = normalizeIdentifierList(customization.selectedOptionIds);

  const removableIngredientsById = new Map(
    configuration.removableIngredients.map((ingredient) => [String(ingredient.ingredientId), ingredient]),
  );
  const allowedExtrasById = new Map(configuration.allowedExtras.map((extra) => [String(extra.id), extra]));

  const removedIngredients = removedIngredientIds.map((ingredientId) => {
    const ingredient = removableIngredientsById.get(ingredientId);

    assert(
      ingredient,
      400,
      'INVALID_REMOVED_INGREDIENT',
      'Uno o piu ingredienti rimossi non sono validi per questo prodotto.',
    );

    return {
      ingredientId: ingredient.ingredientId,
      name: ingredient.name,
    };
  });

  const addedExtras = addedExtraIds.map((extraId) => {
    const extra = allowedExtrasById.get(extraId);

    assert(
      extra,
      400,
      'INVALID_EXTRA_SELECTION',
      'Uno o piu extra selezionati non sono disponibili per questo prodotto.',
    );

    return {
      extraIngredientId: extra.id,
      ingredientId: extra.ingredientId,
      name: extra.name,
      extraPrice: extra.extraPrice,
    };
  });

  const selectedOptions = selectOptions(configuration.optionGroups, selectedOptionIds).map((option) => ({
    optionId: String(option.id),
    groupName: option.groupName,
    groupSlug: option.groupSlug,
    optionName: option.optionName,
    priceDelta: option.priceDelta,
  }));

  const finalUnitPrice = roundCurrency(
    configuration.item.basePrice +
      selectedOptions.reduce((sum, option) => sum + option.priceDelta, 0) +
      addedExtras.reduce((sum, extra) => sum + extra.extraPrice, 0),
  );

  return {
    item: configuration.item,
    basePrice: configuration.item.basePrice,
    finalUnitPrice,
    defaultIngredients: configuration.defaultIngredients.map((ingredient) => ({
      ingredientId: ingredient.ingredientId,
      name: ingredient.name,
      isRemovable: Boolean(ingredient.isRemovable),
    })),
    removedIngredients,
    addedExtras,
    selectedOptions,
  };
}

export async function buildOrderLine(menuItemId, quantity, note, customization = {}) {
  const resolvedPricing = await resolveMenuItemPricing(menuItemId, customization);
  const normalizedQuantity = Number(quantity);

  assert(
    Number.isInteger(normalizedQuantity) && normalizedQuantity >= 1,
    400,
    'INVALID_QUANTITY',
    'Controlla le quantita presenti nel carrello.',
  );

  const lineTotal = roundCurrency(resolvedPricing.finalUnitPrice * normalizedQuantity);

  return {
    menuItemId: resolvedPricing.item.id,
    itemNameSnapshot: resolvedPricing.item.name,
    basePriceSnapshot: resolvedPricing.basePrice,
    finalUnitPrice: resolvedPricing.finalUnitPrice,
    quantity: normalizedQuantity,
    lineTotal,
    notes: note || null,
    customization: {
      removedIngredients: resolvedPricing.removedIngredients,
      addedExtras: resolvedPricing.addedExtras,
      selectedOptions: resolvedPricing.selectedOptions,
      defaultIngredients: resolvedPricing.defaultIngredients,
      specialNotes: note || null,
    },
  };
}

export function calculateOrderTotals(lines, orderType = 'pickup') {
  const subtotal = roundCurrency(lines.reduce((sum, line) => sum + line.lineTotal, 0));
  const deliveryFee = orderType === 'delivery' && lines.length > 0 ? DELIVERY_FEE : 0;
  const total = roundCurrency(subtotal + deliveryFee);

  return {
    subtotal,
    deliveryFee,
    total,
  };
}
