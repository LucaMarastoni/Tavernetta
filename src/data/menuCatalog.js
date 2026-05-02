import rawMenuCatalog from './menu.json?raw';
import {
  buildAllowedExtrasFromIngredientCatalog,
  createDefaultAllowedExtras,
  curateAllowedExtras,
  CUSTOMIZABLE_CATEGORY_SLUGS,
  resolveOptionPriceDelta,
} from '../../shared/menuExtraProfiles.js';

const CATEGORY_META_BY_KEY = {
  'le classiche': { name: 'Le Classiche', slug: 'le-pizze' },
  'le bianche': { name: 'Le Bianche', slug: 'le-bianche' },
  'le speciali': { name: 'Le Speciali', slug: 'le-speciali' },
  'i calzoni': { name: 'I Calzoni', slug: 'i-calzoni' },
  'calzoni in fritteria': { name: 'Calzoni in Fritteria', slug: 'calzoni-in-fritteria' },
};

const CATEGORY_IMAGE_IDS = {
  'le-pizze': ['photo-1513104890138-7c749659a591', 'photo-1414235077428-338989a2e8c0'],
  'le-bianche': ['photo-1504674900247-0877df9cc836', 'photo-1498654896293-37aacf113fd9'],
  'le-speciali': ['photo-1544025162-d76694265947', 'photo-1559339352-11d035aa65de'],
  'i-calzoni': ['photo-1514933651103-005eec06c04b', 'photo-1513104890138-7c749659a591'],
  'calzoni-in-fritteria': ['photo-1414235077428-338989a2e8c0', 'photo-1498654896293-37aacf113fd9'],
  fallback: ['photo-1414235077428-338989a2e8c0'],
};

function normalizeText(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function slugify(value = '') {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanInlineText(value = '') {
  return value
    .toString()
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();
}

function withBase(path) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
}

function resolveItemImage(categorySlug, itemIndex) {
  const imageIds = CATEGORY_IMAGE_IDS[categorySlug] ?? CATEGORY_IMAGE_IDS.fallback;
  const imageId = imageIds[itemIndex % imageIds.length];

  return withBase(`images/editorial/${imageId}.jpg`);
}

function normalizeSelectionType(value = '') {
  return value === 'multiple' ? 'multiple' : 'single';
}

function toBoolean(value) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'si'].includes(value.toLowerCase());
  }

  return Boolean(value);
}

function toPositiveInteger(value, fallbackValue) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallbackValue;
}

function mapOptionGroups(rawItem, itemId) {
  const rawGroups = rawItem.optionGroups ?? rawItem.opzioni ?? rawItem.varianti ?? [];

  if (!Array.isArray(rawGroups)) {
    return [];
  }

  return rawGroups
    .map((rawGroup, groupIndex) => {
      const name = cleanInlineText(rawGroup.name ?? rawGroup.label ?? rawGroup.titolo ?? `Scelta ${groupIndex + 1}`);
      const selectionType = normalizeSelectionType(rawGroup.selectionType ?? rawGroup.type ?? rawGroup.tipo);
      const required = toBoolean(rawGroup.required ?? rawGroup.obbligatoria);
      const rawOptions = rawGroup.options ?? rawGroup.scelte ?? rawGroup.items ?? [];

      if (!Array.isArray(rawOptions) || !rawOptions.length) {
        return null;
      }

      const options = rawOptions
        .map((rawOption, optionIndex) => {
          const optionName = cleanInlineText(
            rawOption.optionName ?? rawOption.name ?? rawOption.label ?? rawOption.titolo ?? `Opzione ${optionIndex + 1}`,
          );

          if (!optionName) {
            return null;
          }

          const optionId = itemId * 10000 + groupIndex * 100 + optionIndex + 1;

          return {
            id: optionId,
            optionId,
            groupName: name,
            groupSlug: slugify(name),
            optionName,
            description: cleanInlineText(rawOption.description ?? rawOption.sottotitolo ?? ''),
            priceDelta: resolveOptionPriceDelta(
              optionName,
              rawOption.priceDelta ?? rawOption.extraPrice ?? rawOption.prezzo ?? 0,
              name,
            ),
            isDefault: toBoolean(rawOption.defaultSelected ?? rawOption.isDefault ?? rawOption.predefinita),
          };
        })
        .filter(Boolean);

      if (!options.length) {
        return null;
      }

      const maxSelections =
        selectionType === 'single'
          ? 1
          : toPositiveInteger(rawGroup.maxSelections ?? rawGroup.max ?? rawGroup.massimo, options.length);
      const minSelections = toPositiveInteger(
        rawGroup.minSelections ?? rawGroup.min ?? rawGroup.minimo,
        required ? 1 : 0,
      );

      return {
        id: itemId * 100 + groupIndex + 1,
        slug: slugify(name),
        name,
        description: cleanInlineText(rawGroup.description ?? rawGroup.subtitle ?? rawGroup.istruzione ?? ''),
        selectionType,
        required,
        minSelections,
        maxSelections,
        options,
      };
    })
    .filter(Boolean);
}

function mapAllowedExtras(rawItem, itemId) {
  const rawExtras = rawItem.allowedExtras ?? rawItem.extra ?? rawItem.extras ?? [];

  if (!Array.isArray(rawExtras)) {
    return [];
  }

  return rawExtras
    .map((rawExtra, extraIndex) => {
      const name = cleanInlineText(rawExtra.name ?? rawExtra.label ?? rawExtra.titolo ?? '');

      if (!name) {
        return null;
      }

      const extraId = itemId * 1000 + extraIndex + 1;

      return {
        id: extraId,
        extraIngredientId: extraId,
        ingredientId: extraId,
        name,
        allergenInfo: cleanInlineText(rawExtra.allergenInfo ?? rawExtra.allergeni ?? ''),
        extraPrice: Number(rawExtra.extraPrice ?? rawExtra.prezzo ?? 0),
      };
    })
    .filter(Boolean);
}

function mapDefaultIngredients(ingredients, itemId) {
  return ingredients.map((ingredientName, index) => {
    const ingredientId = itemId * 1000 + index + 1;
    const isRemovable = !/a piacere/i.test(ingredientName);

    return {
      id: ingredientId,
      ingredientId,
      name: ingredientName,
      slug: slugify(ingredientName),
      allergenInfo: null,
      isRemovable,
      sortOrder: index,
    };
  });
}

function createIngredientCatalog(menuSections) {
  const ingredientBySlug = new Map();

  menuSections.forEach((section) => {
    (Array.isArray(section.items) ? section.items : []).forEach((item) => {
      (Array.isArray(item.ingredienti) ? item.ingredienti : []).map(cleanInlineText).filter(Boolean).forEach((ingredientName) => {
        const slug = slugify(ingredientName);

        if (!slug || ingredientBySlug.has(slug)) {
          return;
        }

        ingredientBySlug.set(slug, {
          name: ingredientName,
          slug,
          allergenInfo: null,
        });
      });
    });
  });

  return [...ingredientBySlug.values()]
    .sort((left, right) => left.name.localeCompare(right.name, 'it', { sensitivity: 'base' }))
    .map((ingredient, index) => ({
      id: index + 1,
      ingredientId: index + 1,
      ...ingredient,
      sortOrder: index + 1,
    }));
}

function sanitizeBrokenJson(raw) {
  let output = '';
  let inString = false;
  let escaped = false;

  for (const char of raw) {
    if (escaped) {
      output += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      output += char;
      escaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      output += char;
      continue;
    }

    if (inString && (char === '\n' || char === '\r' || char === '\t')) {
      output += ' ';
      continue;
    }

    output += char;
  }

  return output;
}

function parseMenuSource() {
  const parsed = JSON.parse(sanitizeBrokenJson(rawMenuCatalog));
  return Array.isArray(parsed?.menu) ? parsed.menu : [];
}

function mapTags(item) {
  const tags = [];
  const note = cleanInlineText(item.note || '');

  if (item.piccante) {
    tags.push('Piccante');
  }

  if (item.vegetariana) {
    tags.push('Vegetariana');
  }

  if (/fuori cottura/i.test(note)) {
    tags.push('Fuori cottura');
  } else if (/in cottura/i.test(note)) {
    tags.push('In cottura');
  }

  return tags;
}

function buildDescription(item) {
  const ingredients = Array.isArray(item.ingredienti) ? item.ingredienti.map(cleanInlineText).filter(Boolean) : [];
  const note = cleanInlineText(item.note || '');
  const parts = [];

  if (ingredients.length) {
    parts.push(ingredients.join(', '));
  }

  if (note) {
    parts.push(note);
  }

  return parts.join('. ');
}

function mapCategory(rawCategory, categoryIndex, itemIdRef) {
  const normalizedCategoryName = cleanInlineText(rawCategory.categoria || `Categoria ${categoryIndex + 1}`);
  const categoryMeta = CATEGORY_META_BY_KEY[normalizeText(normalizedCategoryName)] ?? {
    name: normalizedCategoryName,
    slug: slugify(normalizedCategoryName),
  };

  const categoryId = categoryIndex + 1;
  const itemsWithCustomization = Array.isArray(rawCategory.items)
    ? rawCategory.items.map((rawItem, itemIndex) => {
        const nextItemId = itemIdRef.current;
        itemIdRef.current += 1;

        const name = cleanInlineText(rawItem.nome || `Prodotto ${itemIndex + 1}`);
        const price = Number(rawItem.prezzo || 0);
        const ingredients = Array.isArray(rawItem.ingredienti)
          ? rawItem.ingredienti.map(cleanInlineText).filter(Boolean)
          : [];
        const defaultIngredients = mapDefaultIngredients(ingredients, nextItemId);
        const isCustomizableCategory = CUSTOMIZABLE_CATEGORY_SLUGS.has(categoryMeta.slug);
        const removableIngredients = isCustomizableCategory
          ? defaultIngredients.filter((ingredient) => ingredient.isRemovable)
          : [];
        const optionGroups = mapOptionGroups(rawItem, nextItemId);
        const explicitExtras = mapAllowedExtras(rawItem, nextItemId);
        const allowedExtras = curateAllowedExtras(
          defaultIngredients,
          explicitExtras.length || !CUSTOMIZABLE_CATEGORY_SLUGS.has(categoryMeta.slug)
            ? explicitExtras
            : createDefaultAllowedExtras(nextItemId),
        );

        return {
          item: {
            id: nextItemId,
            categoryId,
            categorySlug: categoryMeta.slug,
            name,
            slug: slugify(name),
            description: buildDescription(rawItem),
            basePrice: price,
            price,
            imageUrl: resolveItemImage(categoryMeta.slug, itemIndex),
            tags: mapTags(rawItem),
            allergens: Array.isArray(rawItem.allergeni) ? rawItem.allergeni.map((entry) => String(entry)) : [],
            active: rawItem.active !== false,
            featured: false,
            sortOrder: itemIndex,
            hasCustomization:
              removableIngredients.length > 0 || allowedExtras.length > 0 || optionGroups.length > 0,
            ingredients,
            note: cleanInlineText(rawItem.note || ''),
          },
          customization: {
            defaultIngredients,
            removableIngredients,
            allowedExtras,
            optionGroups,
          },
        };
      })
    : [];

  const items = itemsWithCustomization.map((entry) => entry.item).filter((item) => item.active);

  return {
    id: categoryId,
    name: categoryMeta.name,
    slug: categoryMeta.slug,
    sortOrder: categoryIndex,
    items,
    customizationByItemId: Object.fromEntries(itemsWithCustomization.map((entry) => [String(entry.item.id), entry.customization])),
  };
}

function createCatalog() {
  const itemIdRef = { current: 1 };
  const menuSections = parseMenuSource();
  const ingredientCatalog = createIngredientCatalog(menuSections);
  const categories = menuSections
    .map((category, index) => mapCategory(category, index, itemIdRef))
    .filter((category) => category.items.length > 0);

  const allItems = categories.flatMap((category) => category.items);
  const customizationByItemId = Object.assign(
    {},
    ...categories.map((category) => category.customizationByItemId ?? {}),
  );

  return {
    categories: categories.map(({ customizationByItemId: _ignoredCustomizationByItemId, ...category }) => category),
    featuredItems: allItems.slice(0, 4),
    itemsById: Object.fromEntries(allItems.map((item) => [String(item.id), item])),
    customizationByItemId,
    ingredientCatalog,
  };
}

const localCatalog = createCatalog();

export function getLocalMenuCatalog() {
  return localCatalog;
}

export function getLocalMenuItemCustomization(menuItemId) {
  const item = localCatalog.itemsById[String(menuItemId)];
  const customization = localCatalog.customizationByItemId[String(menuItemId)];

  if (!item) {
    throw new Error('Questo prodotto non e disponibile.');
  }

  return {
    item,
    defaultIngredients: customization?.defaultIngredients ?? [],
    removableIngredients: customization?.removableIngredients ?? [],
    allowedExtras: buildAllowedExtrasFromIngredientCatalog(
      customization?.defaultIngredients ?? [],
      localCatalog.ingredientCatalog ?? [],
      customization?.allowedExtras ?? [],
    ),
    optionGroups: customization?.optionGroups ?? [],
    pricing: {
      currency: 'EUR',
      basePrice: item.basePrice,
    },
  };
}
