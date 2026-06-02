import { getBrowserSupabase, hasBrowserSupabaseConfig } from '../lib/supabaseBrowser';

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
const MENU_ITEM_FLAGS_SELECT = `id, slug, name, spicy, vegetarian, ${ALLERGEN_FIELDS.join(', ')}`;

function createAdminMenuError(code, message = code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeText(value) {
  return String(value || '').trim();
}

function getClient() {
  const client = getBrowserSupabase();

  if (!client) {
    throw createAdminMenuError('SUPABASE_NOT_CONFIGURED', 'Supabase non e configurato per modificare il menu.');
  }

  return client;
}

function isMissingMenuItemAllergenColumn(error) {
  const message = `${error?.message || ''} ${error?.details || ''}`;
  return error?.code === '42703' && /allergen_/i.test(message);
}

function normalizeFlags(row = {}) {
  return {
    id: normalizeText(row.id),
    slug: normalizeText(row.slug),
    name: normalizeText(row.name),
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

export function canUseSupabaseAdminMenu() {
  return hasBrowserSupabaseConfig();
}

async function fetchMenuItemFlagRow(identifier) {
  const normalizedSlug = normalizeText(identifier?.slug ?? identifier);
  const normalizedName = normalizeText(identifier?.name);

  if (!normalizedSlug && !normalizedName) {
    throw createAdminMenuError('INVALID_MENU_ITEM', 'Pizza non valida.');
  }

  const client = getClient();
  const queryBySlug = normalizedSlug
    ? await client
        .from('menu_items')
        .select(MENU_ITEM_FLAGS_SELECT)
        .eq('slug', normalizedSlug)
        .limit(1)
    : { data: [], error: null };

  if (queryBySlug.error && isMissingMenuItemAllergenColumn(queryBySlug.error)) {
    throw createAdminMenuError(
      'MENU_ALLERGEN_COLUMNS_MISSING',
      'Le colonne allergeni non esistono ancora su Supabase.',
    );
  }

  if (queryBySlug.error) {
    throw createAdminMenuError(queryBySlug.error.code || 'MENU_FLAGS_LOAD_FAILED', queryBySlug.error.message || 'Non riusciamo a leggere la pizza da Supabase.');
  }

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

  if (queryByName.error && isMissingMenuItemAllergenColumn(queryByName.error)) {
    throw createAdminMenuError(
      'MENU_ALLERGEN_COLUMNS_MISSING',
      'Le colonne allergeni non esistono ancora su Supabase.',
    );
  }

  if (queryByName.error) {
    throw createAdminMenuError(queryByName.error.code || 'MENU_FLAGS_LOAD_FAILED', queryByName.error.message || 'Non riusciamo a leggere la pizza da Supabase.');
  }

  if (!queryByName.data?.[0]) {
    throw createAdminMenuError('MENU_ITEM_NOT_FOUND', 'Pizza non trovata su Supabase.');
  }

  return queryByName.data[0];
}

export async function fetchSupabaseMenuItemFlags(identifier) {
  return normalizeFlags(await fetchMenuItemFlagRow(identifier));
}

export async function updateSupabaseMenuItemFlags(identifier, flags) {
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
      'Le colonne allergeni non esistono ancora su Supabase.',
    );
  }

  if (error) {
    throw createAdminMenuError(error.code || 'MENU_FLAGS_UPDATE_FAILED', error.message || 'Non riusciamo ad aggiornare la pizza su Supabase.');
  }

  if (!data) {
    throw createAdminMenuError('MENU_ITEM_NOT_FOUND', 'Pizza non trovata su Supabase.');
  }

  return normalizeFlags(data);
}
