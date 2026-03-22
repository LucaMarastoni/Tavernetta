import rawMenuCatalog from './menu.json?raw';

const CATEGORY_META_BY_KEY = {
  'le classiche': { name: 'Le Classiche', slug: 'le-pizze' },
  'le bianche': { name: 'Le Bianche', slug: 'le-bianche' },
  'le speciali': { name: 'Le Speciali', slug: 'le-speciali' },
  'i calzoni': { name: 'I Calzoni', slug: 'i-calzoni' },
  'calzoni in fritteria': { name: 'Calzoni in Fritteria', slug: 'calzoni-in-fritteria' },
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
  const items = Array.isArray(rawCategory.items)
    ? rawCategory.items.map((rawItem, itemIndex) => {
        const nextItemId = itemIdRef.current;
        itemIdRef.current += 1;

        const name = cleanInlineText(rawItem.nome || `Prodotto ${itemIndex + 1}`);
        const price = Number(rawItem.prezzo || 0);
        const ingredients = Array.isArray(rawItem.ingredienti)
          ? rawItem.ingredienti.map(cleanInlineText).filter(Boolean)
          : [];

        return {
          id: nextItemId,
          categoryId,
          categorySlug: categoryMeta.slug,
          name,
          slug: slugify(name),
          description: buildDescription(rawItem),
          basePrice: price,
          price,
          imageUrl: '',
          tags: mapTags(rawItem),
          allergens: Array.isArray(rawItem.allergeni) ? rawItem.allergeni.map((entry) => String(entry)) : [],
          active: true,
          featured: false,
          sortOrder: itemIndex,
          hasCustomization: false,
          ingredients,
          note: cleanInlineText(rawItem.note || ''),
        };
      })
    : [];

  return {
    id: categoryId,
    name: categoryMeta.name,
    slug: categoryMeta.slug,
    sortOrder: categoryIndex,
    items,
  };
}

function createCatalog() {
  const itemIdRef = { current: 1 };
  const categories = parseMenuSource()
    .map((category, index) => mapCategory(category, index, itemIdRef))
    .filter((category) => category.items.length > 0);

  const allItems = categories.flatMap((category) => category.items);

  return {
    categories,
    featuredItems: allItems.slice(0, 4),
    itemsById: Object.fromEntries(allItems.map((item) => [String(item.id), item])),
  };
}

const localCatalog = createCatalog();

export function getLocalMenuCatalog() {
  return localCatalog;
}

export function getLocalMenuItemCustomization(menuItemId) {
  const item = localCatalog.itemsById[String(menuItemId)];

  if (!item) {
    throw new Error('Questo prodotto non e disponibile.');
  }

  return {
    item,
    defaultIngredients: item.ingredients.map((ingredientName, index) => ({
      id: item.id * 1000 + index + 1,
      ingredientId: item.id * 1000 + index + 1,
      name: ingredientName,
      slug: slugify(ingredientName),
      allergenInfo: null,
      isRemovable: false,
      sortOrder: index,
    })),
    removableIngredients: [],
    allowedExtras: [],
    optionGroups: [],
  };
}
