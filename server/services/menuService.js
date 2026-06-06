import { getSupabaseAdmin, getSupabaseStorageBucket, hasSupabaseConfig } from '../lib/supabase.js';
import { HttpError } from '../utils/httpError.js';
import {
  buildAllowedExtrasFromIngredientCatalog,
  curateAllowedExtras,
  CUSTOMIZABLE_CATEGORY_SLUGS,
  resolveOptionPriceDelta,
} from '../../shared/menuExtraProfiles.js';

const MENU_PLACEHOLDER_IMAGE_URL = '/images/editorial/impasto-pizza-ingredienti.jpg';

const CATEGORY_META_BY_KEY = {
  'le classiche': { name: 'Le Classiche', slug: 'le-pizze' },
  'le pizze': { name: 'Le Classiche', slug: 'le-pizze' },
  'le bianche': { name: 'Le Bianche', slug: 'le-bianche' },
  'le speciali': { name: 'Le Speciali', slug: 'le-speciali' },
  'i calzoni': { name: 'I Calzoni', slug: 'i-calzoni' },
  'calzoni in fritteria': { name: 'Calzoni in Fritteria', slug: 'calzoni-in-fritteria' },
};

const MENU_ITEM_BASE_SELECT = 'id, category_id, name, slug, description, base_price, image_path, active, featured, sort_order, spicy, vegetarian, note';
const MENU_ITEM_ALLERGEN_SELECT =
  'allergen_nuts, allergen_milk, allergen_frozen, allergen_gluten, allergen_eggs, allergen_fish, allergen_mollusks, allergen_crustaceans';
const MENU_ITEM_SELECT = `${MENU_ITEM_BASE_SELECT}, ${MENU_ITEM_ALLERGEN_SELECT}`;
const MENU_ITEM_ALLERGEN_FIELDS = [
  ['allergen_nuts', '1'],
  ['allergen_milk', '2'],
  ['allergen_frozen', '3'],
  ['allergen_gluten', '4'],
  ['allergen_eggs', '5'],
  ['allergen_fish', '6'],
  ['allergen_mollusks', '7'],
  ['allergen_crustaceans', '8'],
];

function normalizeId(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
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
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

function normalizeNumber(value, fallbackValue = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

function normalizePositiveInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(value, 10);
  return Number.isInteger(parsedValue) && parsedValue >= 0 ? parsedValue : fallbackValue;
}

function sortByOrderThenName(left, right) {
  return (
    normalizeNumber(left.sortOrder ?? left.sort_order) - normalizeNumber(right.sortOrder ?? right.sort_order) ||
    left.name.localeCompare(right.name, 'it', { sensitivity: 'base' })
  );
}

function sortByOrderThenId(left, right) {
  return (
    normalizeNumber(left.sortOrder ?? left.sort_order) - normalizeNumber(right.sortOrder ?? right.sort_order) ||
    String(left.id).localeCompare(String(right.id), 'it', { numeric: true, sensitivity: 'base' })
  );
}

function proxyMediaUrl(url) {
  if (!url) {
    return '';
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === 'images.unsplash.com') {
      return `/api/media?src=${encodeURIComponent(url)}`;
    }

    return url;
  } catch {
    return url;
  }
}

function resolveFallbackImageUrl() {
  return MENU_PLACEHOLDER_IMAGE_URL;
}

function resolveSupabaseImageUrl(client, imagePath) {
  const cleanedPath = cleanInlineText(imagePath);

  if (!cleanedPath) {
    return resolveFallbackImageUrl();
  }

  if (/^https?:\/\//i.test(cleanedPath)) {
    return proxyMediaUrl(cleanedPath);
  }

  if (cleanedPath.startsWith('/')) {
    return cleanedPath;
  }

  const bucket = getSupabaseStorageBucket();

  if (!bucket) {
    return cleanedPath;
  }

  const { data } = client.storage.from(bucket).getPublicUrl(cleanedPath);
  return data?.publicUrl || cleanedPath;
}

function mapTags(row) {
  const tags = [];
  const note = cleanInlineText(row.note || '');

  if (row.spicy) {
    tags.push('Piccante');
  }

  if (row.vegetarian) {
    tags.push('Vegetariana');
  }

  if (/fuori cottura/i.test(note)) {
    tags.push('Fuori cottura');
  } else if (/in cottura/i.test(note)) {
    tags.push('In cottura');
  }

  return tags;
}

function mapAllergens(row) {
  return MENU_ITEM_ALLERGEN_FIELDS.filter(([field]) => Boolean(row[field])).map(([, code]) => code);
}

function buildMenuItemDescription(row, defaultIngredients = []) {
  if (cleanInlineText(row.description)) {
    return cleanInlineText(row.description);
  }

  const ingredientNames = defaultIngredients.map((ingredient) => ingredient.name).filter(Boolean);
  const note = cleanInlineText(row.note || '');
  const parts = [];

  if (ingredientNames.length) {
    parts.push(ingredientNames.join(', '));
  }

  if (note) {
    parts.push(note);
  }

  return parts.join('. ');
}

function isMissingSupabaseResource(error) {
  return (
    ['42P01', '42703', 'PGRST116', 'PGRST204', 'PGRST205'].includes(error?.code) ||
    /Could not find/i.test(error?.message || '') ||
    /does not exist/i.test(error?.message || '') ||
    /schema cache/i.test(error?.message || '')
  );
}

async function runSupabaseQuery(promise, { optional = false, fallbackValue = [] } = {}) {
  const { data, error } = await promise;

  if (error) {
    if (optional && isMissingSupabaseResource(error)) {
      return fallbackValue;
    }

    throw new HttpError(500, 'SUPABASE_QUERY_FAILED', 'Non riusciamo a leggere i dati del menu.', error.message);
  }

  return data ?? fallbackValue;
}

function createMapById(rows) {
  return new Map(rows.map((row) => [normalizeId(row.id), row]));
}

function isMissingMenuItemAllergenColumn(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`;
  return error?.code === '42703' && /allergen_/i.test(message);
}

function assertSupabaseMenuConfig() {
  if (!hasSupabaseConfig()) {
    throw new HttpError(
      500,
      'SUPABASE_MENU_NOT_CONFIGURED',
      'Il servizio menu non e configurato.',
      'Configurazione server mancante.',
    );
  }
}

async function runMenuItemQueryWithAllergenFallback(client, applyFilters) {
  const primaryResult = await applyFilters(client.from('menu_items').select(MENU_ITEM_SELECT));

  if (!primaryResult.error) {
    return primaryResult.data ?? [];
  }

  if (!isMissingMenuItemAllergenColumn(primaryResult.error)) {
    throw new HttpError(
      500,
      'SUPABASE_QUERY_FAILED',
      'Non riusciamo a leggere i dati del menu.',
      primaryResult.error.message,
    );
  }

  const fallbackResult = await applyFilters(client.from('menu_items').select(MENU_ITEM_BASE_SELECT));

  if (fallbackResult.error) {
    throw new HttpError(
      500,
      'SUPABASE_QUERY_FAILED',
      'Non riusciamo a leggere i dati del menu.',
      fallbackResult.error.message,
    );
  }

  return fallbackResult.data ?? [];
}

function isMissingIngredientAllergenInfo(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`;
  return error?.code === '42703' && /allergen_info/i.test(message);
}

async function runIngredientQueryWithFallback(client, applyFilters) {
  const primaryQuery = applyFilters(client.from('ingredients').select('id, name, slug, allergen_info, active'));
  const primaryResult = await primaryQuery;

  if (!primaryResult.error) {
    return primaryResult.data ?? [];
  }

  if (!isMissingIngredientAllergenInfo(primaryResult.error)) {
    throw new HttpError(
      500,
      'SUPABASE_QUERY_FAILED',
      'Non riusciamo a leggere i dati del menu.',
      primaryResult.error.message,
    );
  }

  const fallbackQuery = applyFilters(client.from('ingredients').select('id, name, slug, active'));
  const fallbackResult = await fallbackQuery;

  if (fallbackResult.error) {
    throw new HttpError(
      500,
      'SUPABASE_QUERY_FAILED',
      'Non riusciamo a leggere i dati del menu.',
      fallbackResult.error.message,
    );
  }

  return fallbackResult.data ?? [];
}

function resolveCategoryMeta(name, slug = '') {
  const cleanedName = cleanInlineText(name);
  const cleanedSlug = cleanInlineText(slug);
  const normalizedName = normalizeText(cleanedName);
  const normalizedSlug = normalizeText(cleanedSlug).replace(/-/g, ' ');

  return (
    CATEGORY_META_BY_KEY[normalizedName] ??
    CATEGORY_META_BY_KEY[normalizedSlug] ?? {
      name: cleanedName,
      slug: cleanedSlug || slugify(cleanedName),
    }
  );
}

function normalizeCategory(category) {
  const categoryMeta = resolveCategoryMeta(category.name, category.slug);

  return {
    id: normalizeId(category.id),
    name: categoryMeta.name,
    slug: categoryMeta.slug,
    sourceSlug: cleanInlineText(category.slug),
    sortOrder: normalizeNumber(category.sort_order ?? category.sortOrder),
  };
}

function dedupeCategories(categories) {
  const categoryBySlug = new Map();

  categories.forEach((category) => {
    const existingCategory = categoryBySlug.get(category.slug);

    if (!existingCategory) {
      categoryBySlug.set(category.slug, category);
      return;
    }

    const currentIsCanonical = existingCategory.sourceSlug === existingCategory.slug;
    const nextIsCanonical = category.sourceSlug === category.slug;

    if (nextIsCanonical && !currentIsCanonical) {
      categoryBySlug.set(category.slug, category);
      return;
    }

    if (nextIsCanonical === currentIsCanonical) {
      const shouldReplace =
        category.sortOrder < existingCategory.sortOrder ||
        (category.sortOrder === existingCategory.sortOrder &&
          category.id.localeCompare(existingCategory.id, 'it', { sensitivity: 'base' }) < 0);

      if (shouldReplace) {
        categoryBySlug.set(category.slug, category);
      }
    }
  });

  return [...categoryBySlug.values()]
    .map(({ sourceSlug: _ignoredSourceSlug, ...category }) => category)
    .sort(sortByOrderThenName);
}

function normalizeIngredientLink(link, ingredientById) {
  const ingredient = ingredientById.get(normalizeId(link.ingredient_id));
  const menuItemId = normalizeId(link.menu_item_id);

  if (!ingredient || ingredient.active === false) {
    return null;
  }

  return {
    id: `${menuItemId}:${normalizeId(ingredient.id)}`,
    menuItemId,
    ingredientId: normalizeId(ingredient.id),
    name: cleanInlineText(ingredient.name),
    slug: cleanInlineText(ingredient.slug),
    allergenInfo: cleanInlineText(ingredient.allergen_info || ''),
    isRemovable: link.is_removable === null ? null : Boolean(link.is_removable),
    sortOrder: normalizeNumber(link.sort_order),
  };
}

function normalizeAllowedExtra(extraLink, extraById, ingredientById) {
  const extra = extraById.get(normalizeId(extraLink.extra_ingredient_id));

  if (!extra || extra.active === false) {
    return null;
  }

  const ingredient = ingredientById.get(normalizeId(extra.ingredient_id));

  if (!ingredient || ingredient.active === false) {
    return null;
  }

  return {
    id: normalizeId(extra.id),
    extraIngredientId: normalizeId(extra.id),
    ingredientId: normalizeId(ingredient.id),
    name: cleanInlineText(ingredient.name),
    slug: cleanInlineText(ingredient.slug),
    allergenInfo: cleanInlineText(ingredient.allergen_info || ''),
    extraPrice: normalizeNumber(extra.extra_price),
    sortOrder: normalizeNumber(extra.sort_order),
  };
}

function normalizeOptionGroup(group, rawOptions) {
  const name = cleanInlineText(group.name || 'Scelta');
  const options = rawOptions
    .filter((option) => option.active !== false)
    .map((option) => ({
      id: normalizeId(option.id),
      optionId: normalizeId(option.id),
      groupName: name,
      groupSlug: cleanInlineText(group.slug) || slugify(name),
      optionName: cleanInlineText(option.name || option.option_name || 'Opzione'),
      description: cleanInlineText(option.description || ''),
      priceDelta: resolveOptionPriceDelta(option.name || option.option_name || 'Opzione', option.price_delta, name),
      isDefault: Boolean(option.is_default),
      sortOrder: normalizeNumber(option.sort_order),
    }))
    .sort(sortByOrderThenId);

  const selectionType = group.selection_type === 'multiple' ? 'multiple' : 'single';
  const fallbackMaxSelections = selectionType === 'single' ? 1 : options.length;

  return {
    id: normalizeId(group.id),
    slug: cleanInlineText(group.slug) || slugify(name),
    name,
    description: cleanInlineText(group.description || ''),
    selectionType,
    required: Boolean(group.required),
    minSelections: normalizePositiveInteger(group.min_selections, Boolean(group.required) ? 1 : 0),
    maxSelections: normalizePositiveInteger(group.max_selections, fallbackMaxSelections),
    sortOrder: normalizeNumber(group.sort_order),
    options,
  };
}

function buildGroupedLegacyOptions(rows) {
  const groupMap = new Map();

  rows
    .filter((row) => row.active !== false)
    .forEach((row) => {
      const menuItemId = normalizeId(row.menu_item_id);
      const groupSlug = cleanInlineText(row.option_group_slug) || slugify(row.option_group_name || 'Scelta');
      const groupKey = `${menuItemId}:${groupSlug}`;
      const groupName = cleanInlineText(row.option_group_name || 'Scelta');
      const existingGroup = groupMap.get(groupKey);

      const normalizedOption = {
        id: normalizeId(row.id),
        optionId: normalizeId(row.id),
        groupName,
        groupSlug,
        optionName: cleanInlineText(row.option_name || 'Opzione'),
        description: '',
        priceDelta: resolveOptionPriceDelta(row.option_name || 'Opzione', row.price_delta, groupName),
        isDefault: Boolean(row.is_default),
        sortOrder: normalizeNumber(row.sort_order),
      };

      if (existingGroup) {
        existingGroup.options.push(normalizedOption);
        return;
      }

      groupMap.set(groupKey, {
        menuItemId,
        id: groupKey,
        slug: groupSlug,
        name: groupName,
        description: '',
        selectionType: 'single',
        required: false,
        minSelections: 0,
        maxSelections: 1,
        sortOrder: normalizeNumber(row.sort_order),
        options: [normalizedOption],
      });
    });

  const optionGroupsByItemId = new Map();

  [...groupMap.values()]
    .map((group) => ({
      ...group,
      options: group.options.sort(sortByOrderThenId),
    }))
    .sort(sortByOrderThenId)
    .forEach((group) => {
      const existingGroups = optionGroupsByItemId.get(group.menuItemId) ?? [];
      optionGroupsByItemId.set(group.menuItemId, [...existingGroups, group]);
    });

  return optionGroupsByItemId;
}

async function loadSupabaseRelations(client, menuItemIds) {
  if (!menuItemIds.length) {
    return {
      defaultIngredientsByItemId: new Map(),
      removableIngredientsByItemId: new Map(),
      allowedExtrasByItemId: new Map(),
      optionGroupsByItemId: new Map(),
    };
  }

  const ingredientLinks = await runSupabaseQuery(
    client
      .from('menu_item_ingredients')
      .select('menu_item_id, ingredient_id, is_removable, sort_order')
      .in('menu_item_id', menuItemIds),
  );

  const extraLinks = await runSupabaseQuery(
    client.from('menu_item_allowed_extras').select('menu_item_id, extra_ingredient_id').in('menu_item_id', menuItemIds),
    { optional: true, fallbackValue: [] },
  );

  const extraIds = [...new Set(extraLinks.map((row) => normalizeId(row.extra_ingredient_id)).filter(Boolean))];
  const extras = extraIds.length
    ? await runSupabaseQuery(
        client
          .from('extra_ingredients')
          .select('id, ingredient_id, extra_price, sort_order, active')
          .in('id', extraIds),
        { optional: true, fallbackValue: [] },
      )
    : [];

  const ingredientIds = [
    ...new Set(
      [
        ...ingredientLinks.map((row) => normalizeId(row.ingredient_id)),
        ...extras.map((row) => normalizeId(row.ingredient_id)),
      ].filter(Boolean),
    ),
  ];

  const ingredients = ingredientIds.length
    ? await runIngredientQueryWithFallback(client, (query) => query.in('id', ingredientIds))
    : [];

  const ingredientById = createMapById(ingredients);
  const extraById = createMapById(extras);

  const defaultIngredientsByItemId = new Map();
  const removableIngredientsByItemId = new Map();

  ingredientLinks
    .map((link) => normalizeIngredientLink(link, ingredientById))
    .filter(Boolean)
    .sort(sortByOrderThenId)
    .forEach((ingredient) => {
      const menuItemId = ingredient.menuItemId;
      const currentIngredients = defaultIngredientsByItemId.get(menuItemId) ?? [];
      defaultIngredientsByItemId.set(menuItemId, [...currentIngredients, ingredient]);

      if (ingredient.isRemovable) {
        const currentRemovableIngredients = removableIngredientsByItemId.get(menuItemId) ?? [];
        removableIngredientsByItemId.set(menuItemId, [...currentRemovableIngredients, ingredient]);
      }
    });

  const allowedExtrasByItemId = new Map();

  extraLinks
    .map((link) => ({
      menuItemId: normalizeId(link.menu_item_id),
      extra: normalizeAllowedExtra(link, extraById, ingredientById),
    }))
    .filter((entry) => Boolean(entry.extra))
    .sort((left, right) => sortByOrderThenId(left.extra, right.extra))
    .forEach(({ menuItemId, extra }) => {
      const currentExtras = allowedExtrasByItemId.get(menuItemId) ?? [];
      allowedExtrasByItemId.set(menuItemId, [...currentExtras, extra]);
    });

  const optionGroups = await runSupabaseQuery(
    client
      .from('option_groups')
      .select('id, menu_item_id, name, slug, description, selection_type, required, min_selections, max_selections, sort_order, active')
      .in('menu_item_id', menuItemIds),
    { optional: true, fallbackValue: [] },
  );

  const optionGroupIds = optionGroups.map((group) => normalizeId(group.id)).filter(Boolean);
  const optionChoices = optionGroupIds.length
    ? await runSupabaseQuery(
        client
          .from('option_choices')
          .select('id, option_group_id, name, description, price_delta, is_default, sort_order, active')
          .in('option_group_id', optionGroupIds),
        { optional: true, fallbackValue: [] },
      )
    : [];

  const optionGroupsByItemId = new Map();

  optionGroups
    .filter((group) => group.active !== false)
    .sort((left, right) => sortByOrderThenId(left, right))
    .forEach((group) => {
      const normalizedGroup = normalizeOptionGroup(
        group,
        optionChoices.filter((choice) => normalizeId(choice.option_group_id) === normalizeId(group.id)),
      );
      const menuItemId = normalizeId(group.menu_item_id);
      const currentGroups = optionGroupsByItemId.get(menuItemId) ?? [];
      optionGroupsByItemId.set(menuItemId, [...currentGroups, normalizedGroup]);
    });

  if (!optionGroupsByItemId.size) {
    const legacyOptionRows = await runSupabaseQuery(
      client
        .from('product_options')
        .select('id, menu_item_id, option_group_name, option_group_slug, option_name, price_delta, is_default, sort_order, active')
        .in('menu_item_id', menuItemIds),
      { optional: true, fallbackValue: [] },
    );

    return {
      defaultIngredientsByItemId,
      removableIngredientsByItemId,
      allowedExtrasByItemId,
      optionGroupsByItemId: buildGroupedLegacyOptions(legacyOptionRows),
    };
  }

  return {
    defaultIngredientsByItemId,
    removableIngredientsByItemId,
    allowedExtrasByItemId,
    optionGroupsByItemId,
  };
}

function buildSupabaseMenuItem(row, category, client, relations) {
  const itemId = normalizeId(row.id);
  const defaultIngredients = relations.defaultIngredientsByItemId.get(itemId) ?? [];
  const isCustomizableCategory = CUSTOMIZABLE_CATEGORY_SLUGS.has(category.slug);
  const removableIngredients = isCustomizableCategory
    ? relations.removableIngredientsByItemId.get(itemId) ?? []
    : [];
  const allowedExtras = isCustomizableCategory
    ? curateAllowedExtras(defaultIngredients, relations.allowedExtrasByItemId.get(itemId) ?? [])
    : [];
  const optionGroups = isCustomizableCategory ? relations.optionGroupsByItemId.get(itemId) ?? [] : [];

  return {
    id: itemId,
    categoryId: normalizeId(row.category_id),
    categorySlug: category.slug,
    name: cleanInlineText(row.name),
    slug: cleanInlineText(row.slug),
    description: buildMenuItemDescription(row, defaultIngredients),
    basePrice: normalizeNumber(row.base_price),
    imageUrl: resolveSupabaseImageUrl(client, row.image_path),
    tags: mapTags(row),
    allergens: mapAllergens(row),
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    sortOrder: normalizeNumber(row.sort_order),
    hasCustomization: Boolean(removableIngredients.length || allowedExtras.length || optionGroups.length),
  };
}

async function getSupabaseActiveCategories(categorySlug) {
  const client = getSupabaseAdmin();
  const rows = await runSupabaseQuery(
    client.from('categories').select('id, name, slug, sort_order').eq('active', true).order('sort_order').order('name'),
  );

  const categories = dedupeCategories(rows.map(normalizeCategory));

  if (!categorySlug) {
    return categories;
  }

  return categories.filter((category) => category.slug === categorySlug);
}

async function getSupabaseItemRows(categoryIds) {
  if (!categoryIds.length) {
    return [];
  }

  const client = getSupabaseAdmin();
  return runMenuItemQueryWithAllergenFallback(
    client,
    (query) => query.eq('active', true).in('category_id', categoryIds),
  );
}

async function getSupabaseCatalogData({ categorySlug } = {}) {
  const client = getSupabaseAdmin();
  const categories = await getSupabaseActiveCategories(categorySlug);

  if (!categories.length) {
    return {
      categories: [],
      items: [],
    };
  }

  const categoryById = new Map(categories.map((category) => [normalizeId(category.id), category]));
  const itemRows = await getSupabaseItemRows(categories.map((category) => category.id));
  const itemIds = itemRows.map((row) => normalizeId(row.id));
  const relations = await loadSupabaseRelations(client, itemIds);

  const items = itemRows
    .map((row) => {
      const category = categoryById.get(normalizeId(row.category_id));
      return category ? buildSupabaseMenuItem(row, category, client, relations) : null;
    })
    .filter(Boolean)
    .sort((left, right) => {
      const leftCategory = categoryById.get(left.categoryId);
      const rightCategory = categoryById.get(right.categoryId);
      return (
        normalizeNumber(leftCategory?.sortOrder) - normalizeNumber(rightCategory?.sortOrder) ||
        sortByOrderThenName(left, right)
      );
    });

  return {
    categories,
    items,
  };
}

async function getSupabaseMenuItemRow(menuItemId) {
  const client = getSupabaseAdmin();
  const rows = await runMenuItemQueryWithAllergenFallback(
    client,
    (query) => query.eq('id', menuItemId).eq('active', true).limit(1),
  );
  const data = rows[0] ?? null;

  if (!data) {
    throw new HttpError(404, 'MENU_ITEM_NOT_FOUND', 'Questo prodotto non e disponibile.');
  }

  const categories = await getSupabaseActiveCategories();
  const category = categories.find((entry) => entry.id === normalizeId(data.category_id));

  if (!category) {
    throw new HttpError(404, 'MENU_ITEM_NOT_FOUND', 'Questo prodotto non e disponibile.');
  }

  return {
    category,
    row: data,
  };
}

async function getSupabaseIngredientCatalog(client = getSupabaseAdmin()) {
  const rows = await runIngredientQueryWithFallback(
    client,
    (query) => query.eq('active', true).order('name'),
  );

  return rows
    .filter((ingredient) => ingredient.active !== false)
    .map((ingredient) => ({
      id: normalizeId(ingredient.id),
      ingredientId: normalizeId(ingredient.id),
      name: cleanInlineText(ingredient.name),
      slug: cleanInlineText(ingredient.slug),
      allergenInfo: cleanInlineText(ingredient.allergen_info || ''),
      sortOrder: 0,
    }))
    .sort(sortByOrderThenName);
}

export function getMenuDataSource() {
  return 'supabase';
}

export async function getActiveCategories() {
  assertSupabaseMenuConfig();
  return getSupabaseActiveCategories();
}

export async function getActiveMenuItems({ categorySlug } = {}) {
  assertSupabaseMenuConfig();
  const { items } = await getSupabaseCatalogData({ categorySlug });
  return items;
}

export async function getMenuCatalog() {
  assertSupabaseMenuConfig();
  const { categories, items } = await getSupabaseCatalogData();
  const itemsByCategoryId = new Map();

  items.forEach((item) => {
    const currentItems = itemsByCategoryId.get(item.categoryId) ?? [];
    itemsByCategoryId.set(item.categoryId, [...currentItems, item]);
  });

  const categoriesWithItems = categories
    .map((category) => ({
      ...category,
      items: (itemsByCategoryId.get(category.id) ?? []).sort(sortByOrderThenName),
    }))
    .filter((category) => category.items.length > 0);

  const featuredItems = items.filter((item) => item.featured);

  return {
    categories: categoriesWithItems,
    featuredItems: (featuredItems.length ? featuredItems : items).slice(0, 4),
    itemsById: Object.fromEntries(items.map((item) => [item.id, item])),
  };
}

export async function getMenuItemById(menuItemId) {
  assertSupabaseMenuConfig();
  const client = getSupabaseAdmin();
  const normalizedMenuItemId = normalizeId(menuItemId);
  const { category, row } = await getSupabaseMenuItemRow(normalizedMenuItemId);
  const relations = await loadSupabaseRelations(client, [normalizedMenuItemId]);
  return buildSupabaseMenuItem(row, category, client, relations);
}

export async function getMenuItemCustomization(menuItemId) {
  assertSupabaseMenuConfig();
  const client = getSupabaseAdmin();
  const normalizedMenuItemId = normalizeId(menuItemId);
  const { category, row } = await getSupabaseMenuItemRow(normalizedMenuItemId);
  const relations = await loadSupabaseRelations(client, [normalizedMenuItemId]);
  const item = buildSupabaseMenuItem(row, category, client, relations);
  const defaultIngredients = relations.defaultIngredientsByItemId.get(normalizedMenuItemId) ?? [];
  const ingredientCatalog = await getSupabaseIngredientCatalog(client);
  const isCustomizableCategory = CUSTOMIZABLE_CATEGORY_SLUGS.has(category.slug);
  const visibleDefaultIngredients = isCustomizableCategory
    ? defaultIngredients
    : defaultIngredients.map((ingredient) => ({ ...ingredient, isRemovable: false }));
  const allowedExtras = isCustomizableCategory
    ? buildAllowedExtrasFromIngredientCatalog(
        defaultIngredients,
        ingredientCatalog,
        relations.allowedExtrasByItemId.get(normalizedMenuItemId) ?? [],
      )
    : [];

  return {
    item,
    defaultIngredients: visibleDefaultIngredients,
    removableIngredients: isCustomizableCategory
      ? relations.removableIngredientsByItemId.get(normalizedMenuItemId) ?? []
      : [],
    allowedExtras,
    optionGroups: isCustomizableCategory ? relations.optionGroupsByItemId.get(normalizedMenuItemId) ?? [] : [],
    pricing: {
      currency: 'EUR',
      basePrice: item.basePrice,
    },
  };
}
