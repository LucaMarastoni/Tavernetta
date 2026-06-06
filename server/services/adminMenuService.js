import { getSupabaseAdmin, hasSupabaseConfig } from '../lib/supabase.js';
import { HttpError } from '../utils/httpError.js';
import { normalizeIdentifier, normalizeText } from '../utils/validators.js';

const ALLERGEN_FIELD_BY_CODE = {
  1: 'allergen_nuts',
  2: 'allergen_milk',
  3: 'allergen_frozen',
  4: 'allergen_gluten',
  5: 'allergen_eggs',
  6: 'allergen_fish',
  7: 'allergen_mollusks',
  8: 'allergen_crustaceans',
};

const ALLERGEN_FIELDS = Object.values(ALLERGEN_FIELD_BY_CODE);
const CANONICAL_CATEGORY_SLUG_BY_NAME = {
  'le classiche': 'le-pizze',
  'le pizze': 'le-pizze',
  'le bianche': 'le-bianche',
  'le speciali': 'le-speciali',
  'i calzoni': 'i-calzoni',
  'calzoni in fritteria': 'calzoni-in-fritteria',
};
const MENU_ITEM_FLAGS_SELECT = `id, category_id, slug, name, image_path, active, spicy, vegetarian, ${ALLERGEN_FIELDS.join(', ')}`;
const MENU_ITEM_SELECT = `id, category_id, name, slug, description, base_price, image_path, active, featured, sort_order, note, ${ALLERGEN_FIELDS.join(', ')}`;

function assertSupabaseAdminMenuConfig() {
  if (!hasSupabaseConfig()) {
    throw new HttpError(
      500,
      'SUPABASE_MENU_NOT_CONFIGURED',
      'Il servizio menu non e configurato.',
      'Configurazione server mancante.',
    );
  }
}

function isMissingMenuItemAllergenColumn(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`;
  return error?.code === '42703' && /allergen_/i.test(message);
}

function getMenuItemErrorMessage(error, fallbackCode) {
  const message = error?.message || '';

  if (/duplicate key value/i.test(message) && /menu_item_ingredients/i.test(message)) {
    return 'Controlla gli ingredienti del piatto: alcuni risultano duplicati.';
  }

  if (/duplicate key value/i.test(message) && /menu_items_slug/i.test(message)) {
    return 'Esiste gia un piatto con questo nome.';
  }

  if (fallbackCode.includes('CREATE') || fallbackCode.includes('UPDATE')) {
    return 'Non riusciamo a salvare il piatto.';
  }

  if (fallbackCode.includes('DELETE')) {
    return 'Non riusciamo a rimuovere il piatto.';
  }

  return 'Non riusciamo a leggere i dati del menu.';
}

function handleMenuItemQueryError(error, fallbackCode = 'SUPABASE_QUERY_FAILED') {
  if (!error) {
    return;
  }

  if (isMissingMenuItemAllergenColumn(error)) {
    throw new HttpError(
      500,
      'MENU_ALLERGEN_COLUMNS_MISSING',
      'La gestione allergeni non e ancora configurata.',
      error.message,
    );
  }

  throw new HttpError(500, fallbackCode, getMenuItemErrorMessage(error, fallbackCode), error.message);
}

function normalizeFlags(row = {}) {
  return {
    id: normalizeIdentifier(row.id),
    slug: normalizeIdentifier(row.slug),
    name: normalizeText(row.name),
    imagePath: normalizeText(row.image_path),
    active: row.active !== false,
    spicy: Boolean(row.spicy),
    vegetarian: Boolean(row.vegetarian),
    allergens: Object.entries(ALLERGEN_FIELD_BY_CODE)
      .filter(([, field]) => Boolean(row[field]))
      .map(([code]) => Number(code)),
  };
}

function normalizeComparableText(value = '') {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function slugify(value = '') {
  return normalizeComparableText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function normalizeIngredientNames(value) {
  const names = (Array.isArray(value) ? value : String(value || '').split(','))
    .map(normalizeText)
    .filter(Boolean);
  const seenKeys = new Set();

  return names.filter((ingredientName) => {
    const key = slugify(ingredientName) || normalizeComparableText(ingredientName);

    if (!key || seenKeys.has(key)) {
      return false;
    }

    seenKeys.add(key);
    return true;
  });
}

function buildFlagsPayload(flags = {}) {
  const allergenCodes = new Set((Array.isArray(flags.allergens) ? flags.allergens : []).map((entry) => Number(entry)));

  return {
    spicy: Boolean(flags.spicy),
    vegetarian: Boolean(flags.vegetarian),
    ...Object.fromEntries(
      Object.entries(ALLERGEN_FIELD_BY_CODE).map(([code, field]) => [field, allergenCodes.has(Number(code))]),
    ),
  };
}

function normalizeMenuItemPayload(payload = {}) {
  const name = normalizeText(payload.name);
  const categoryName = normalizeText(payload.categoryName);
  const price = normalizePrice(payload.price);
  const ingredients = normalizeIngredientNames(payload.ingredients);

  if (!name) {
    throw new HttpError(400, 'INVALID_MENU_ITEM_NAME', 'Inserisci il nome della pizza.');
  }

  if (!categoryName) {
    throw new HttpError(400, 'INVALID_MENU_ITEM_CATEGORY', 'Inserisci la categoria della pizza.');
  }

  if (price === null) {
    throw new HttpError(400, 'INVALID_MENU_ITEM_PRICE', 'Inserisci un prezzo valido.');
  }

  return {
    name,
    categoryName,
    price,
    ingredients,
    note: normalizeText(payload.note) || null,
    imagePath: normalizeText(payload.imagePath),
    active: payload.active !== false,
    spicy: Boolean(payload.spicy),
    vegetarian: Boolean(payload.vegetarian),
    allergens: Array.isArray(payload.allergens) ? payload.allergens : [],
  };
}

async function resolveCategory(supabase, categoryName, preferredCategoryId = '') {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, sort_order, active')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('slug', { ascending: true });

  handleMenuItemQueryError(error);

  const normalizedCategoryName = normalizeComparableText(categoryName);
  const normalizedPreferredCategoryId = normalizeIdentifier(preferredCategoryId);
  const preferredCategory = (data ?? []).find(
    (category) =>
      normalizeIdentifier(category.id) === normalizedPreferredCategoryId &&
      normalizeComparableText(category.name) === normalizedCategoryName,
  );

  if (preferredCategory) {
    return preferredCategory;
  }

  const canonicalSlug = CANONICAL_CATEGORY_SLUG_BY_NAME[normalizedCategoryName] ?? '';
  const canonicalCategory = canonicalSlug
    ? (data ?? []).find((category) => slugify(category.slug) === canonicalSlug)
    : null;

  if (canonicalCategory) {
    return canonicalCategory;
  }

  const existingCategory = (data ?? []).find((category) => normalizeComparableText(category.name) === normalizedCategoryName);

  if (existingCategory) {
    return existingCategory;
  }

  const nextSortOrder = Math.max(0, ...(data ?? []).map((category) => Number(category.sort_order) || 0)) + 1;
  const { data: createdCategory, error: createError } = await supabase
    .from('categories')
    .insert({
      name: categoryName,
      slug: canonicalSlug || slugify(categoryName) || `categoria-${Date.now()}`,
      sort_order: nextSortOrder,
      active: true,
    })
    .select('id, name, slug, sort_order, active')
    .single();

  handleMenuItemQueryError(createError, 'SUPABASE_CATEGORY_CREATE_FAILED');
  return createdCategory;
}

async function getNextMenuItemSortOrder(supabase, categoryId) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('sort_order')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: false })
    .limit(1);

  handleMenuItemQueryError(error);
  return (Number(data?.[0]?.sort_order) || 0) + 1;
}

async function resolveUniqueMenuItemSlug(supabase, baseSlug, excludedMenuItemId = '') {
  const normalizedBaseSlug = slugify(baseSlug) || `pizza-${Date.now()}`;
  const normalizedExcludedId = normalizeIdentifier(excludedMenuItemId);

  for (let index = 0; index < 100; index += 1) {
    const candidateSlug = index === 0 ? normalizedBaseSlug : `${normalizedBaseSlug}-${index + 1}`;
    const { data, error } = await supabase
      .from('menu_items')
      .select('id')
      .eq('slug', candidateSlug)
      .limit(1);

    handleMenuItemQueryError(error);

    const existingId = normalizeIdentifier(data?.[0]?.id);

    if (!existingId || existingId === normalizedExcludedId) {
      return candidateSlug;
    }
  }

  return `${normalizedBaseSlug}-${Date.now()}`;
}

async function resolveIngredient(supabase, ingredientName) {
  const ingredientSlug = slugify(ingredientName) || `ingrediente-${Date.now()}`;
  const { data: existingRows, error: selectError } = await supabase
    .from('ingredients')
    .select('id, name, slug, active')
    .eq('slug', ingredientSlug)
    .limit(1);

  handleMenuItemQueryError(selectError);

  if (existingRows?.[0]) {
    if (existingRows[0].active === false) {
      const { data: reactivatedIngredient, error: updateError } = await supabase
        .from('ingredients')
        .update({ active: true })
        .eq('id', existingRows[0].id)
        .select('id, name, slug, active')
        .single();

      handleMenuItemQueryError(updateError, 'SUPABASE_INGREDIENT_UPDATE_FAILED');
      return reactivatedIngredient;
    }

    return existingRows[0];
  }

  const { data: createdIngredient, error: createError } = await supabase
    .from('ingredients')
    .insert({
      name: ingredientName,
      slug: ingredientSlug,
      active: true,
    })
    .select('id, name, slug, active')
    .single();

  handleMenuItemQueryError(createError, 'SUPABASE_INGREDIENT_CREATE_FAILED');
  return createdIngredient;
}

async function replaceMenuItemIngredients(supabase, menuItemId, ingredientNames) {
  const { error: deleteError } = await supabase
    .from('menu_item_ingredients')
    .delete()
    .eq('menu_item_id', menuItemId);

  handleMenuItemQueryError(deleteError, 'SUPABASE_MENU_INGREDIENTS_DELETE_FAILED');

  if (!ingredientNames.length) {
    return;
  }

  const ingredients = [];
  const ingredientIds = new Set();

  for (const ingredientName of ingredientNames) {
    const ingredient = await resolveIngredient(supabase, ingredientName);
    const ingredientId = normalizeIdentifier(ingredient.id);

    if (!ingredientIds.has(ingredientId)) {
      ingredientIds.add(ingredientId);
      ingredients.push(ingredient);
    }
  }

  const linkRows = ingredients.map((ingredient, index) => ({
    menu_item_id: menuItemId,
    ingredient_id: ingredient.id,
    is_removable: true,
    sort_order: index + 1,
  }));

  const { error: insertError } = await supabase.from('menu_item_ingredients').insert(linkRows);
  handleMenuItemQueryError(insertError, 'SUPABASE_MENU_INGREDIENTS_UPDATE_FAILED');
}

function buildMenuItemPayload(draft, category, itemSlug, sortOrder) {
  const payload = {
    category_id: category.id,
    name: draft.name,
    slug: itemSlug,
    description: draft.ingredients.join(', '),
    base_price: draft.price,
    image_path: draft.imagePath || null,
    active: draft.active,
    featured: false,
    note: draft.note,
    ...buildFlagsPayload(draft),
  };

  if (Number.isFinite(Number(sortOrder))) {
    payload.sort_order = Number(sortOrder);
  }

  return payload;
}

async function fetchMenuItemFlagRow(identifier) {
  assertSupabaseAdminMenuConfig();

  const normalizedId = normalizeIdentifier(identifier);

  if (!normalizedId) {
    throw new HttpError(400, 'INVALID_MENU_ITEM', 'Pizza non valida.');
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('menu_items')
    .select(MENU_ITEM_FLAGS_SELECT)
    .eq('id', normalizedId)
    .maybeSingle();

  handleMenuItemQueryError(error);

  if (!data) {
    throw new HttpError(404, 'MENU_ITEM_NOT_FOUND', 'Pizza non trovata.');
  }

  return data;
}

export async function getAdminMenuItemFlags(menuItemId) {
  return normalizeFlags(await fetchMenuItemFlagRow(menuItemId));
}

export async function updateAdminMenuItemFlags(menuItemId, flags) {
  assertSupabaseAdminMenuConfig();

  const currentRow = await fetchMenuItemFlagRow(menuItemId);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('menu_items')
    .update(buildFlagsPayload(flags))
    .eq('id', currentRow.id)
    .select(MENU_ITEM_FLAGS_SELECT)
    .maybeSingle();

  handleMenuItemQueryError(error, 'SUPABASE_MENU_UPDATE_FAILED');

  if (!data) {
    throw new HttpError(404, 'MENU_ITEM_NOT_FOUND', 'Pizza non trovata.');
  }

  return normalizeFlags(data);
}

export async function createAdminMenuItem(payload) {
  assertSupabaseAdminMenuConfig();

  const draft = normalizeMenuItemPayload(payload);
  const supabase = getSupabaseAdmin();
  const category = await resolveCategory(supabase, draft.categoryName);
  const sortOrder = await getNextMenuItemSortOrder(supabase, category.id);
  const itemSlug = await resolveUniqueMenuItemSlug(supabase, `${category.slug}-${draft.name}`);
  const { data, error } = await supabase
    .from('menu_items')
    .insert(buildMenuItemPayload(draft, category, itemSlug, sortOrder))
    .select(MENU_ITEM_SELECT)
    .single();

  handleMenuItemQueryError(error, 'SUPABASE_MENU_CREATE_FAILED');
  await replaceMenuItemIngredients(supabase, data.id, draft.ingredients);
  return normalizeFlags(await fetchMenuItemFlagRow(data.id));
}

export async function updateAdminMenuItem(menuItemId, payload) {
  assertSupabaseAdminMenuConfig();

  const normalizedId = normalizeIdentifier(menuItemId);
  const draft = normalizeMenuItemPayload(payload);
  const currentRow = await fetchMenuItemFlagRow(normalizedId);
  const supabase = getSupabaseAdmin();
  const category = await resolveCategory(supabase, draft.categoryName, currentRow.category_id);
  const itemSlug =
    normalizeComparableText(currentRow.name) === normalizeComparableText(draft.name)
      ? currentRow.slug
      : await resolveUniqueMenuItemSlug(supabase, `${category.slug}-${draft.name}`, currentRow.id);
  const { data, error } = await supabase
    .from('menu_items')
    .update(buildMenuItemPayload(draft, category, itemSlug))
    .eq('id', currentRow.id)
    .select(MENU_ITEM_SELECT)
    .maybeSingle();

  handleMenuItemQueryError(error, 'SUPABASE_MENU_UPDATE_FAILED');

  if (!data) {
    throw new HttpError(404, 'MENU_ITEM_NOT_FOUND', 'Pizza non trovata.');
  }

  await replaceMenuItemIngredients(supabase, currentRow.id, draft.ingredients);
  return normalizeFlags(await fetchMenuItemFlagRow(currentRow.id));
}

export async function archiveAdminMenuItem(menuItemId) {
  assertSupabaseAdminMenuConfig();

  const currentRow = await fetchMenuItemFlagRow(menuItemId);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('menu_items')
    .update({ active: false })
    .eq('id', currentRow.id)
    .select('id')
    .maybeSingle();

  handleMenuItemQueryError(error, 'SUPABASE_MENU_DELETE_FAILED');

  if (!data) {
    throw new HttpError(404, 'MENU_ITEM_NOT_FOUND', 'Pizza non trovata.');
  }

  return { id: normalizeIdentifier(data.id) };
}
