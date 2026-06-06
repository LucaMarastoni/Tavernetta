import { getBrowserSupabase, hasBrowserSupabaseConfig } from '../lib/supabaseBrowser';
import { apiDelete, apiGet, apiPatch, apiPost } from '../lib/apiClient';

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
const MENU_ITEM_FLAGS_SELECT = `id, slug, name, image_path, active, spicy, vegetarian, ${ALLERGEN_FIELDS.join(', ')}`;
const isStaticExport = import.meta.env.VITE_STATIC_EXPORT === 'true';
const CANONICAL_CATEGORY_SLUG_BY_NAME = {
  'le classiche': 'le-pizze',
  'le pizze': 'le-pizze',
  'le bianche': 'le-bianche',
  'le speciali': 'le-speciali',
  'i calzoni': 'i-calzoni',
  'calzoni in fritteria': 'calzoni-in-fritteria',
};

function createAdminMenuError(code, message = code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeText(value) {
  return String(value || '').trim();
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

function getClient() {
  const client = getBrowserSupabase();

  if (!client) {
    throw createAdminMenuError('SUPABASE_NOT_CONFIGURED', 'Il servizio menu non e configurato.');
  }

  return client;
}

function isMissingMenuItemAllergenColumn(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`;
  return error?.code === '42703' && /allergen_/i.test(message);
}

function assertMenuItemQuerySuccess(result, fallbackCode = 'MENU_FLAGS_LOAD_FAILED') {
  if (result.error && isMissingMenuItemAllergenColumn(result.error)) {
    throw createAdminMenuError(
      'MENU_ALLERGEN_COLUMNS_MISSING',
      'La gestione allergeni non e ancora configurata.',
    );
  }

  if (result.error) {
    throw createAdminMenuError(
      result.error.code || fallbackCode,
      result.error.message || 'Non riusciamo a leggere la pizza.',
    );
  }
}

function normalizeFlags(row = {}) {
  return {
    id: normalizeText(row.id),
    slug: normalizeText(row.slug),
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

function buildFlagsPayload(flags) {
  const allergenCodes = new Set((Array.isArray(flags.allergens) ? flags.allergens : []).map((entry) => Number(entry)));

  return {
    spicy: Boolean(flags.spicy),
    vegetarian: Boolean(flags.vegetarian),
    ...Object.fromEntries(
      Object.entries(ALLERGEN_FIELD_BY_CODE).map(([code, field]) => [field, allergenCodes.has(Number(code))]),
    ),
  };
}

function normalizeMenuItemDraft(payload = {}) {
  const name = normalizeText(payload.name);
  const categoryName = normalizeText(payload.categoryName);
  const price = normalizePrice(payload.price);

  if (!name) {
    throw createAdminMenuError('INVALID_MENU_ITEM_NAME', 'Inserisci il nome della pizza.');
  }

  if (!categoryName) {
    throw createAdminMenuError('INVALID_MENU_ITEM_CATEGORY', 'Inserisci la categoria della pizza.');
  }

  if (price === null) {
    throw createAdminMenuError('INVALID_MENU_ITEM_PRICE', 'Inserisci un prezzo valido.');
  }

  return {
    name,
    categoryName,
    price,
    ingredients: normalizeIngredientNames(payload.ingredients),
    note: normalizeText(payload.note) || null,
    imagePath: normalizeText(payload.imagePath),
    active: payload.active !== false,
    spicy: Boolean(payload.spicy),
    vegetarian: Boolean(payload.vegetarian),
    allergens: Array.isArray(payload.allergens) ? payload.allergens : [],
  };
}

function normalizeStaticWriteError(error, fallbackCode = 'STATIC_MENU_WRITE_FAILED') {
  if (!error) {
    return null;
  }

  if (isMissingMenuItemAllergenColumn(error)) {
    return createAdminMenuError(
      'MENU_ALLERGEN_COLUMNS_MISSING',
      'La gestione allergeni non e ancora configurata.',
    );
  }

  if (error.code === '42501' || /row-level security/i.test(error.message || '')) {
    return createAdminMenuError(
      'ADMIN_MENU_POLICIES_MISSING',
      'Supabase non permette ancora la modifica completa del menu da admin.',
    );
  }

  return createAdminMenuError(error.code || fallbackCode, error.message || 'Non riusciamo a salvare il piatto.');
}

function assertStaticWriteSuccess(result, fallbackCode) {
  if (result?.error) {
    throw normalizeStaticWriteError(result.error, fallbackCode);
  }
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

export function canUseSupabaseAdminMenu() {
  return !isStaticExport || hasBrowserSupabaseConfig();
}

async function fetchMenuItemFlagRow(identifier) {
  const normalizedId = normalizeText(identifier?.id);
  const normalizedSlug = normalizeText(identifier?.slug ?? identifier);
  const normalizedName = normalizeText(identifier?.name);

  if (!normalizedId && !normalizedSlug && !normalizedName) {
    throw createAdminMenuError('INVALID_MENU_ITEM', 'Pizza non valida.');
  }

  const client = getClient();

  const queryById = normalizedId
    ? await client
        .from('menu_items')
        .select(MENU_ITEM_FLAGS_SELECT)
        .eq('id', normalizedId)
        .limit(1)
    : { data: [], error: null };

  assertMenuItemQuerySuccess(queryById);

  if (queryById.data?.[0]) {
    return queryById.data[0];
  }

  const queryBySlug = normalizedSlug
    ? await client
        .from('menu_items')
        .select(MENU_ITEM_FLAGS_SELECT)
        .eq('slug', normalizedSlug)
        .limit(1)
    : { data: [], error: null };

  assertMenuItemQuerySuccess(queryBySlug);

  if (queryBySlug.data?.[0]) {
    return queryBySlug.data[0];
  }

  const queryByName = normalizedName
    ? await client
        .from('menu_items')
        .select(MENU_ITEM_FLAGS_SELECT)
        .ilike('name', normalizedName)
        .limit(1)
    : { data: [], error: null };

  assertMenuItemQuerySuccess(queryByName);

  if (!queryByName.data?.[0]) {
    throw createAdminMenuError('MENU_ITEM_NOT_FOUND', 'Pizza non trovata.');
  }

  return queryByName.data[0];
}

async function resolveStaticCategory(client, categoryName, preferredCategoryId = '') {
  const result = await client
    .from('categories')
    .select('id, name, slug, sort_order, active')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('slug', { ascending: true });

  assertStaticWriteSuccess(result, 'STATIC_CATEGORY_LOAD_FAILED');

  const categories = result.data ?? [];
  const normalizedCategoryName = normalizeComparableText(categoryName);
  const normalizedPreferredCategoryId = normalizeText(preferredCategoryId);
  const preferredCategory = categories.find(
    (category) =>
      normalizeText(category.id) === normalizedPreferredCategoryId &&
      normalizeComparableText(category.name) === normalizedCategoryName,
  );

  if (preferredCategory) {
    return preferredCategory;
  }

  const canonicalSlug = CANONICAL_CATEGORY_SLUG_BY_NAME[normalizedCategoryName] ?? '';
  const canonicalCategory = canonicalSlug ? categories.find((category) => slugify(category.slug) === canonicalSlug) : null;

  if (canonicalCategory) {
    return canonicalCategory;
  }

  const existingCategory = categories.find((category) => normalizeComparableText(category.name) === normalizedCategoryName);

  if (existingCategory) {
    return existingCategory;
  }

  const nextSortOrder = Math.max(0, ...categories.map((category) => Number(category.sort_order) || 0)) + 1;
  const createResult = await client
    .from('categories')
    .insert({
      name: categoryName,
      slug: canonicalSlug || slugify(categoryName) || `categoria-${Date.now()}`,
      sort_order: nextSortOrder,
      active: true,
    })
    .select('id, name, slug, sort_order, active')
    .single();

  assertStaticWriteSuccess(createResult, 'STATIC_CATEGORY_CREATE_FAILED');
  return createResult.data;
}

async function getNextStaticMenuItemSortOrder(client, categoryId) {
  const result = await client
    .from('menu_items')
    .select('sort_order')
    .eq('category_id', categoryId)
    .order('sort_order', { ascending: false })
    .limit(1);

  assertStaticWriteSuccess(result, 'STATIC_MENU_SORT_LOAD_FAILED');
  return (Number(result.data?.[0]?.sort_order) || 0) + 1;
}

async function resolveUniqueStaticMenuItemSlug(client, baseSlug, excludedMenuItemId = '') {
  const normalizedBaseSlug = slugify(baseSlug) || `pizza-${Date.now()}`;
  const normalizedExcludedId = normalizeText(excludedMenuItemId);

  for (let index = 0; index < 100; index += 1) {
    const candidateSlug = index === 0 ? normalizedBaseSlug : `${normalizedBaseSlug}-${index + 1}`;
    const result = await client
      .from('menu_items')
      .select('id')
      .eq('slug', candidateSlug)
      .limit(1);

    assertStaticWriteSuccess(result, 'STATIC_MENU_SLUG_LOAD_FAILED');

    const existingId = normalizeText(result.data?.[0]?.id);

    if (!existingId || existingId === normalizedExcludedId) {
      return candidateSlug;
    }
  }

  return `${normalizedBaseSlug}-${Date.now()}`;
}

async function resolveStaticIngredient(client, ingredientName) {
  const ingredientSlug = slugify(ingredientName) || `ingrediente-${Date.now()}`;
  const selectResult = await client
    .from('ingredients')
    .select('id, name, slug, active')
    .eq('slug', ingredientSlug)
    .limit(1);

  assertStaticWriteSuccess(selectResult, 'STATIC_INGREDIENT_LOAD_FAILED');

  if (selectResult.data?.[0]) {
    if (selectResult.data[0].active === false) {
      const updateResult = await client
        .from('ingredients')
        .update({ active: true })
        .eq('id', selectResult.data[0].id)
        .select('id, name, slug, active')
        .single();

      assertStaticWriteSuccess(updateResult, 'STATIC_INGREDIENT_UPDATE_FAILED');
      return updateResult.data;
    }

    return selectResult.data[0];
  }

  const createResult = await client
    .from('ingredients')
    .insert({
      name: ingredientName,
      slug: ingredientSlug,
      active: true,
    })
    .select('id, name, slug, active')
    .single();

  assertStaticWriteSuccess(createResult, 'STATIC_INGREDIENT_CREATE_FAILED');
  return createResult.data;
}

async function replaceStaticMenuItemIngredients(client, menuItemId, ingredientNames) {
  const deleteResult = await client
    .from('menu_item_ingredients')
    .delete()
    .eq('menu_item_id', menuItemId);

  assertStaticWriteSuccess(deleteResult, 'STATIC_MENU_INGREDIENTS_DELETE_FAILED');

  if (!ingredientNames.length) {
    return;
  }

  const ingredients = [];
  const ingredientIds = new Set();

  for (const ingredientName of ingredientNames) {
    const ingredient = await resolveStaticIngredient(client, ingredientName);
    const ingredientId = normalizeText(ingredient.id);

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

  const insertResult = await client.from('menu_item_ingredients').insert(linkRows);
  assertStaticWriteSuccess(insertResult, 'STATIC_MENU_INGREDIENTS_UPDATE_FAILED');
}

export async function fetchSupabaseMenuItemFlags(identifier) {
  if (!isStaticExport) {
    const normalizedId = normalizeText(identifier?.id ?? identifier);

    if (!normalizedId) {
      throw createAdminMenuError('INVALID_MENU_ITEM', 'Pizza non valida.');
    }

    const payload = await apiGet(`/api/admin/menu-items/${encodeURIComponent(normalizedId)}/flags`);
    return normalizeFlags(payload?.flags);
  }

  return normalizeFlags(await fetchMenuItemFlagRow(identifier));
}

export async function updateSupabaseMenuItemFlags(identifier, flags) {
  if (!isStaticExport) {
    const normalizedId = normalizeText(identifier?.id ?? identifier);

    if (!normalizedId) {
      throw createAdminMenuError('INVALID_MENU_ITEM', 'Pizza non valida.');
    }

    const payload = await apiPatch(`/api/admin/menu-items/${encodeURIComponent(normalizedId)}/flags`, flags);
    return normalizeFlags(payload?.flags);
  }

  const client = getClient();
  const currentRow = await fetchMenuItemFlagRow(identifier);
  const { data, error } = await client
    .from('menu_items')
    .update(buildFlagsPayload(flags))
    .eq('id', currentRow.id)
    .select(MENU_ITEM_FLAGS_SELECT)
    .maybeSingle();

  if (error && isMissingMenuItemAllergenColumn(error)) {
    throw createAdminMenuError(
      'MENU_ALLERGEN_COLUMNS_MISSING',
      'La gestione allergeni non e ancora configurata.',
    );
  }

  if (error) {
    throw createAdminMenuError(error.code || 'MENU_FLAGS_UPDATE_FAILED', error.message || 'Non riusciamo ad aggiornare la pizza.');
  }

  if (!data) {
    throw createAdminMenuError('MENU_ITEM_NOT_FOUND', 'Pizza non trovata.');
  }

  return normalizeFlags(data);
}

export async function saveSupabaseMenuItem(identifier, draft) {
  const normalizedId = normalizeText(identifier?.id ?? identifier);

  if (isStaticExport) {
    const client = getClient();
    const normalizedDraft = normalizeMenuItemDraft(draft);
    const currentRow = normalizedId ? await fetchMenuItemFlagRow(identifier) : null;
    const category = await resolveStaticCategory(client, normalizedDraft.categoryName, identifier?.categoryId);
    const itemSlug =
      currentRow && normalizeComparableText(currentRow.name) === normalizeComparableText(normalizedDraft.name)
        ? currentRow.slug
        : await resolveUniqueStaticMenuItemSlug(
            client,
            `${category.slug}-${normalizedDraft.name}`,
            currentRow?.id,
          );

    if (currentRow) {
      const updateResult = await client
        .from('menu_items')
        .update(buildMenuItemPayload(normalizedDraft, category, itemSlug))
        .eq('id', currentRow.id)
        .select(MENU_ITEM_FLAGS_SELECT)
        .maybeSingle();

      assertStaticWriteSuccess(updateResult, 'STATIC_MENU_UPDATE_FAILED');

      if (!updateResult.data) {
        throw createAdminMenuError('MENU_ITEM_NOT_FOUND', 'Pizza non trovata.');
      }

      await replaceStaticMenuItemIngredients(client, currentRow.id, normalizedDraft.ingredients);
      return normalizeFlags(updateResult.data);
    }

    const sortOrder = await getNextStaticMenuItemSortOrder(client, category.id);
    const createResult = await client
      .from('menu_items')
      .insert(buildMenuItemPayload(normalizedDraft, category, itemSlug, sortOrder))
      .select(MENU_ITEM_FLAGS_SELECT)
      .single();

    assertStaticWriteSuccess(createResult, 'STATIC_MENU_CREATE_FAILED');
    await replaceStaticMenuItemIngredients(client, createResult.data.id, normalizedDraft.ingredients);
    return normalizeFlags(createResult.data);
  }

  const payload = normalizedId
    ? await apiPatch(`/api/admin/menu-items/${encodeURIComponent(normalizedId)}`, draft)
    : await apiPost('/api/admin/menu-items', draft);

  return payload?.item ?? null;
}

export async function deleteSupabaseMenuItem(identifier) {
  const normalizedId = normalizeText(identifier?.id ?? identifier);

  if (!normalizedId) {
    throw createAdminMenuError('INVALID_MENU_ITEM', 'Pizza non valida.');
  }

  if (isStaticExport) {
    const client = getClient();
    const currentRow = await fetchMenuItemFlagRow(identifier);
    const updateResult = await client
      .from('menu_items')
      .update({ active: false })
      .eq('id', currentRow.id)
      .select('id')
      .maybeSingle();

    assertStaticWriteSuccess(updateResult, 'STATIC_MENU_DELETE_FAILED');

    if (!updateResult.data) {
      throw createAdminMenuError('MENU_ITEM_NOT_FOUND', 'Pizza non trovata.');
    }

    return { id: normalizeText(updateResult.data.id) };
  }

  const payload = await apiDelete(`/api/admin/menu-items/${encodeURIComponent(normalizedId)}`);
  return payload?.item ?? null;
}
