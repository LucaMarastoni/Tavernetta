export const CUSTOMIZABLE_CATEGORY_SLUGS = new Set([
  'le-pizze',
  'le-bianche',
  'le-speciali',
]);

const EXTRA_GROUP = {
  id: 'ingredienti',
  name: 'Ingredienti',
};

const DOUGH_PREMIUM_PATTERNS = ['integrale', 'carbone'];
const DOUBLE_DOUGH_PATTERNS = ['doppio-impasto', 'doppio impasto'];

function cleanInlineText(value = '') {
  if (value === null || value === undefined) {
    return '';
  }

  return value
    .toString()
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();
}
function normalizeText(value = '') {
  if (value === null || value === undefined) {
    return '';
  }

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
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeNumber(value, fallbackValue = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

function matchesPattern(value, patterns = []) {
  return patterns.some((pattern) => value.includes(pattern));
}

function sortAllowedExtras(left, right) {
  return (
    normalizeNumber(left.sortOrder) - normalizeNumber(right.sortOrder) ||
    left.name.localeCompare(right.name, 'it', { sensitivity: 'base' })
  );
}

function normalizeConfiguredExtra(extra, ingredient, index) {
  if (!extra || !ingredient || ingredient.active === false) {
    return null;
  }

  const id = cleanInlineText(extra.id ?? extra.extraIngredientId);
  const ingredientId = cleanInlineText(ingredient.ingredientId ?? ingredient.id ?? extra.ingredientId);
  const name = cleanInlineText(ingredient.name);
  const slug = cleanInlineText(ingredient.slug) || slugify(name);

  if (!id || !ingredientId || !name) {
    return null;
  }

  return {
    ...extra,
    id,
    extraIngredientId: id,
    ingredientId,
    name,
    slug,
    allergenInfo: ingredient.allergenInfo ?? extra.allergenInfo ?? null,
    description: cleanInlineText(extra.description || ''),
    extraPrice: normalizeNumber(extra.extraPrice),
    groupId: EXTRA_GROUP.id,
    groupName: EXTRA_GROUP.name,
    sortOrder: normalizeNumber(extra.sortOrder, index + 1),
  };
}

export function createDefaultAllowedExtras() {
  return [];
}

export function curateAllowedExtras(_defaultIngredients = [], allowedExtras = []) {
  return allowedExtras
    .map((extra, index) =>
      normalizeConfiguredExtra(
        extra,
        {
          id: extra.ingredientId,
          ingredientId: extra.ingredientId,
          name: extra.name,
          slug: extra.slug,
          allergenInfo: extra.allergenInfo,
          active: extra.active,
        },
        index,
      ),
    )
    .filter(Boolean)
    .sort(sortAllowedExtras);
}

export function buildAllowedExtrasFromIngredientCatalog(
  _defaultIngredients = [],
  ingredientCatalog = [],
  explicitExtras = [],
) {
  const ingredientsById = new Map(
    ingredientCatalog
      .map((ingredient) => [cleanInlineText(ingredient.ingredientId ?? ingredient.id), ingredient])
      .filter(([ingredientId]) => Boolean(ingredientId)),
  );

  return explicitExtras
    .map((extra, index) => {
      const ingredientId = cleanInlineText(extra.ingredientId);
      return normalizeConfiguredExtra(extra, ingredientsById.get(ingredientId), index);
    })
    .filter(Boolean)
    .sort(sortAllowedExtras);
}

export function resolveOptionPriceDelta(optionName, priceDelta = 0, groupName = '') {
  const normalizedOption = slugify(optionName);
  const normalizedGroup = slugify(groupName);
  const isDoughOption = normalizedGroup.includes('impasto') || normalizedOption.includes('impasto');

  if (!isDoughOption) {
    return normalizeNumber(priceDelta);
  }

  if (matchesPattern(normalizedOption, DOUBLE_DOUGH_PATTERNS)) {
    return 2;
  }

  if (matchesPattern(normalizedOption, DOUGH_PREMIUM_PATTERNS)) {
    return 1.5;
  }

  return normalizeNumber(priceDelta);
}
