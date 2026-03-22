import { getDatabase } from '../db/database.js';
import { assert, normalizeIntegerList } from '../utils/validators.js';
import { getMenuItemCustomization } from './menuService.js';

export const DELIVERY_FEE = 5;

export function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function selectOptions(optionGroups, selectedOptionIds) {
  const requestedIds = new Set(normalizeIntegerList(selectedOptionIds));
  const selectedOptions = [];

  optionGroups.forEach((group) => {
    const selectedInGroup = group.options.filter((option) => requestedIds.has(option.id));

    assert(
      selectedInGroup.length <= 1,
      400,
      'INVALID_OPTION_SELECTION',
      'Le opzioni selezionate non sono valide per questo prodotto.',
    );

    const resolvedOption = selectedInGroup[0] ?? group.options.find((option) => option.isDefault) ?? group.options[0];

    if (resolvedOption) {
      selectedOptions.push(resolvedOption);
      requestedIds.delete(resolvedOption.id);
    }
  });

  assert(
    requestedIds.size === 0,
    400,
    'INVALID_OPTION_SELECTION',
    'Le opzioni selezionate non sono valide per questo prodotto.',
  );

  return selectedOptions;
}

export function resolveMenuItemPricing(menuItemId, customization = {}, database = getDatabase()) {
  const configuration = getMenuItemCustomization(menuItemId, database);
  const removedIngredientIds = normalizeIntegerList(customization.removedIngredientIds);
  const addedExtraIds = normalizeIntegerList(customization.addedExtraIds);
  const selectedOptionIds = normalizeIntegerList(customization.selectedOptionIds);

  const removableIngredientsById = new Map(
    configuration.removableIngredients.map((ingredient) => [ingredient.ingredientId, ingredient]),
  );
  const allowedExtrasById = new Map(configuration.allowedExtras.map((extra) => [extra.id, extra]));

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
    optionId: option.id,
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

export function buildOrderLine(menuItemId, quantity, note, customization = {}, database = getDatabase()) {
  const resolvedPricing = resolveMenuItemPricing(menuItemId, customization, database);
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
