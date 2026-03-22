function normalizeIntegerList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((entry) => Number(entry)).filter(Number.isInteger))].sort((left, right) => left - right);
}

export function createCartLineIdentity({ menuItemId, selectedOptionIds = [], removedIngredientIds = [], addedExtraIds = [], note = '' }) {
  return JSON.stringify({
    menuItemId: Number(menuItemId),
    selectedOptionIds: normalizeIntegerList(selectedOptionIds),
    removedIngredientIds: normalizeIntegerList(removedIngredientIds),
    addedExtraIds: normalizeIntegerList(addedExtraIds),
    note: note.trim(),
  });
}

export function createCartLine({
  item,
  quantity = 1,
  note = '',
  removedIngredients = [],
  addedExtras = [],
  selectedOptions = [],
  basePrice,
  finalUnitPrice,
}) {
  const normalizedRemovedIngredients = removedIngredients.map((ingredient) => ({
    ingredientId: Number(ingredient.ingredientId ?? ingredient.id),
    name: ingredient.name,
  }));
  const normalizedAddedExtras = addedExtras.map((extra) => ({
    extraIngredientId: Number(extra.extraIngredientId ?? extra.id),
    ingredientId: Number(extra.ingredientId),
    name: extra.name,
    extraPrice: Number(extra.extraPrice ?? extra.price ?? 0),
  }));
  const normalizedSelectedOptions = selectedOptions.map((option) => ({
    optionId: Number(option.optionId ?? option.id),
    groupName: option.groupName,
    groupSlug: option.groupSlug,
    optionName: option.optionName,
    priceDelta: Number(option.priceDelta ?? 0),
  }));
  const trimmedNote = note.trim();

  const lineId = createCartLineIdentity({
    menuItemId: item.id,
    selectedOptionIds: normalizedSelectedOptions.map((option) => option.optionId),
    removedIngredientIds: normalizedRemovedIngredients.map((ingredient) => ingredient.ingredientId),
    addedExtraIds: normalizedAddedExtras.map((extra) => extra.extraIngredientId),
    note: trimmedNote,
  });

  return {
    lineId,
    menuItemId: Number(item.id),
    name: item.name,
    slug: item.slug || '',
    categorySlug: item.categorySlug || '',
    imageUrl: item.imageUrl || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
    quantity: Math.max(1, Number(quantity) || 1),
    basePrice: Number(basePrice ?? item.basePrice ?? item.price ?? 0),
    finalUnitPrice: Number(finalUnitPrice ?? item.basePrice ?? item.price ?? 0),
    note: trimmedNote,
    customization: {
      removedIngredientIds: normalizedRemovedIngredients.map((ingredient) => ingredient.ingredientId),
      removedIngredients: normalizedRemovedIngredients,
      addedExtraIds: normalizedAddedExtras.map((extra) => extra.extraIngredientId),
      addedExtras: normalizedAddedExtras,
      selectedOptionIds: normalizedSelectedOptions.map((option) => option.optionId),
      selectedOptions: normalizedSelectedOptions,
    },
  };
}

function normalizeCartLine(line) {
  if (!line || typeof line !== 'object') {
    return null;
  }

  if ('menuItemId' in line && 'lineId' in line && line.customization) {
    return createCartLine({
      item: {
        id: line.menuItemId,
        name: line.name,
        slug: line.slug,
        categorySlug: line.categorySlug,
        imageUrl: line.imageUrl,
        tags: line.tags,
        basePrice: line.basePrice,
      },
      quantity: line.quantity,
      note: line.note,
      removedIngredients: line.customization?.removedIngredients ?? [],
      addedExtras: line.customization?.addedExtras ?? [],
      selectedOptions: line.customization?.selectedOptions ?? [],
      basePrice: line.basePrice,
      finalUnitPrice: line.finalUnitPrice,
    });
  }

  if ('id' in line) {
    return createCartLine({
      item: {
        id: line.id,
        name: line.name,
        imageUrl: line.imageUrl,
        tags: line.tags,
        basePrice: line.price,
      },
      quantity: line.quantity,
      finalUnitPrice: Number(line.price ?? 0),
      basePrice: Number(line.price ?? 0),
    });
  }

  return null;
}

export function normalizeStoredCart(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(normalizeCartLine).filter(Boolean);
}

export function getCartLineSummary(line) {
  const summary = [];

  if (line.customization?.selectedOptions?.length) {
    line.customization.selectedOptions.forEach((option) => {
      summary.push(`${option.groupName}: ${option.optionName}`);
    });
  }

  if (line.customization?.removedIngredients?.length) {
    summary.push(
      `Senza ${line.customization.removedIngredients.map((ingredient) => ingredient.name.toLowerCase()).join(', ')}`,
    );
  }

  if (line.customization?.addedExtras?.length) {
    summary.push(
      `Extra ${line.customization.addedExtras.map((extra) => extra.name.toLowerCase()).join(', ')}`,
    );
  }

  if (line.note) {
    summary.push(`Nota: ${line.note}`);
  }

  return summary;
}

export function isSameCartLine(leftLine, rightLine) {
  return leftLine?.lineId === rightLine?.lineId;
}
