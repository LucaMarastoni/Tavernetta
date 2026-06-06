import { ALLERGEN_LABELS, formatAllergenLabel } from '../utils/allergens';

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

function readCatalogItemTags(item) {
  return Array.isArray(item?.tags) ? item.tags.map(normalizeAdminText) : [];
}

function readCatalogItemIngredients(item) {
  if (Array.isArray(item?.ingredients)) {
    return item.ingredients.map(cleanInlineText).filter(Boolean);
  }

  return cleanInlineText(item?.description || '')
    .split(',')
    .map(cleanInlineText)
    .filter(Boolean);
}

function mapCatalogItemToAdminItem(item, categorySlug, itemIndex) {
  const itemName = cleanInlineText(item?.name || `Pizza ${itemIndex + 1}`);
  const tags = readCatalogItemTags(item);

  return {
    id: item?.id ? String(item.id) : createItemId(categorySlug, itemName, itemIndex),
    name: itemName,
    slug: cleanInlineText(item?.slug) || slugifyAdminValue(itemName),
    price: Number(item?.basePrice ?? item?.price ?? 0),
    allergens: Array.isArray(item?.allergens)
      ? item.allergens.map((entry) => Number(entry)).filter((entry) => Number.isFinite(entry))
      : [],
    spicy: Boolean(item?.spicy) || tags.includes('piccante'),
    vegetarian: Boolean(item?.vegetarian) || tags.includes('vegetariana'),
    ingredients: readCatalogItemIngredients(item),
    imagePath: cleanInlineText(item?.imagePath ?? item?.imageUrl ?? ''),
    active: item?.active !== false,
    note: cleanInlineText(item?.note || ''),
  };
}

export function createEmptyAdminMenuState() {
  return [];
}

export function createAdminMenuStateFromCatalog(catalog) {
  const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];

  return categories.map((category, categoryIndex) => {
    const name = cleanInlineText(category?.name || `Categoria ${categoryIndex + 1}`);
    const slug = cleanInlineText(category?.slug) || slugifyAdminValue(name) || `categoria-${categoryIndex + 1}`;

    return {
      id: category?.id ? String(category.id) : createCategoryId(name, categoryIndex),
      name,
      slug,
      items: Array.isArray(category?.items)
        ? category.items.map((item, itemIndex) => mapCatalogItemToAdminItem(item, slug, itemIndex))
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
  return Object.keys(ALLERGEN_LABELS)
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry))
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
    imagePath: item?.imagePath ?? '',
    active: item?.active !== false,
    note: item?.note ?? '',
  };
}
