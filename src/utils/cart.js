function normalizeId(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeIdList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((entry) => normalizeId(entry)).filter(Boolean))].sort((left, right) =>
    left.localeCompare(right, 'it', { numeric: true, sensitivity: 'base' }),
  );
}

export function createCartLineIdentity({ menuItemId, selectedOptionIds = [], removedIngredientIds = [], addedExtraIds = [], note = '' }) {
  return JSON.stringify({
    menuItemId: normalizeId(menuItemId),
    selectedOptionIds: normalizeIdList(selectedOptionIds),
    removedIngredientIds: normalizeIdList(removedIngredientIds),
    addedExtraIds: normalizeIdList(addedExtraIds),
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
    ingredientId: normalizeId(ingredient.ingredientId ?? ingredient.id),
    name: ingredient.name,
  }));
  const normalizedAddedExtras = addedExtras.map((extra) => ({
    extraIngredientId: normalizeId(extra.extraIngredientId ?? extra.id),
    ingredientId: normalizeId(extra.ingredientId),
    name: extra.name,
    extraPrice: Number(extra.extraPrice ?? extra.price ?? 0),
  }));
  const normalizedSelectedOptions = selectedOptions.map((option) => ({
    optionId: normalizeId(option.optionId ?? option.id),
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
    menuItemId: normalizeId(item.id),
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
      `Ingredienti extra ${line.customization.addedExtras.map((extra) => extra.name.toLowerCase()).join(', ')}`,
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
