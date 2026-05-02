import rawMenuSource from './menu.json?raw';
import { formatAllergenLabel } from '../utils/allergens';

export function normalizeAdminText(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function slugifyAdminValue(value = '') {
  return normalizeAdminText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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

function cleanInlineText(value = '') {
  return value
    .toString()
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim();
}

function createCategoryId(name, index) {
  const slug = slugifyAdminValue(name) || `categoria-${index + 1}`;
  return `category-${slug}-${index + 1}`;
}

function createItemId(categorySlug, itemName, index) {
  const itemSlug = slugifyAdminValue(itemName) || `item-${index + 1}`;
  return `pizza-${categorySlug}-${itemSlug}-${index + 1}`;
}

function parseMenuSource() {
  const parsed = JSON.parse(sanitizeBrokenJson(rawMenuSource));
  return Array.isArray(parsed?.menu) ? parsed.menu : [];
}

export function createAdminMenuState() {
  return parseMenuSource().map((rawCategory, categoryIndex) => {
    const name = cleanInlineText(rawCategory.categoria || `Categoria ${categoryIndex + 1}`);
    const slug = slugifyAdminValue(name) || `categoria-${categoryIndex + 1}`;

    return {
      id: createCategoryId(name, categoryIndex),
      name,
      slug,
      items: Array.isArray(rawCategory.items)
        ? rawCategory.items.map((rawItem, itemIndex) => {
            const itemName = cleanInlineText(rawItem.nome || `Pizza ${itemIndex + 1}`);

            return {
              id: createItemId(slug, itemName, itemIndex),
              name: itemName,
              price: Number(rawItem.prezzo ?? 0),
              allergens: Array.isArray(rawItem.allergeni)
                ? rawItem.allergeni.map((entry) => Number(entry)).filter((entry) => Number.isFinite(entry))
                : [],
              spicy: Boolean(rawItem.piccante),
              vegetarian: Boolean(rawItem.vegetariana),
              ingredients: Array.isArray(rawItem.ingredienti)
                ? rawItem.ingredienti.map(cleanInlineText).filter(Boolean)
                : [],
              note: cleanInlineText(rawItem.note || ''),
            };
          })
        : [],
    };
  });
}

export function flattenAdminMenu(menuState) {
  return menuState.flatMap((category) =>
    category.items.map((item) => ({
      ...item,
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
    })),
  );
}

export function getAdminAllergenOptions(menuState) {
  return Array.from(
    new Set(
      flattenAdminMenu(menuState).flatMap((item) =>
        item.allergens.filter((entry) => Number.isFinite(Number(entry))).map((entry) => Number(entry)),
      ),
    ),
  )
    .sort((left, right) => left - right)
    .map((code) => ({
      code,
      label: formatAllergenLabel(code),
    }));
}

export function buildAdminMenuStats(menuState) {
  const items = flattenAdminMenu(menuState);
  const allergenCountByCode = new Map();

  items.forEach((item) => {
    item.allergens.forEach((code) => {
      allergenCountByCode.set(code, (allergenCountByCode.get(code) ?? 0) + 1);
    });
  });

  const [topAllergenCode, topAllergenCount] =
    [...allergenCountByCode.entries()].sort((left, right) => right[1] - left[1])[0] ?? [];

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return {
    categoryCount: menuState.length,
    itemCount: items.length,
    spicyCount: items.filter((item) => item.spicy).length,
    vegetarianCount: items.filter((item) => item.vegetarian).length,
    averagePrice: items.length ? totalPrice / items.length : 0,
    itemsWithAllergensCount: items.filter((item) => item.allergens.length).length,
    topAllergenCode: topAllergenCode ?? null,
    topAllergenCount: topAllergenCount ?? 0,
  };
}

export function buildPizzaFormState(item, fallbackCategoryName = '') {
  return {
    id: item?.id ?? null,
    name: item?.name ?? '',
    price: item?.price?.toString?.() ?? '',
    categoryName: item?.categoryName ?? fallbackCategoryName ?? '',
    ingredients: Array.isArray(item?.ingredients) ? item.ingredients.join(', ') : '',
    allergens: Array.isArray(item?.allergens) ? item.allergens.map((entry) => Number(entry)) : [],
    spicy: Boolean(item?.spicy),
    vegetarian: Boolean(item?.vegetarian),
    note: item?.note ?? '',
  };
}
