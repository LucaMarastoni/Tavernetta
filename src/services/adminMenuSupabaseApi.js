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
const MENU_ITEM_FLAGS_SELECT = `id, slug, name, spicy, vegetarian, ${ALLERGEN_FIELDS.join(', ')}`;
const isStaticExport = import.meta.env.VITE_STATIC_EXPORT === 'true';

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
  if (isStaticExport) {
    throw createAdminMenuError(
      'STATIC_MENU_WRITE_UNSUPPORTED',
      'La creazione e modifica completa delle pizze richiede il server admin.',
    );
  }

  const normalizedId = normalizeText(identifier?.id ?? identifier);
  const payload = normalizedId
    ? await apiPatch(`/api/admin/menu-items/${encodeURIComponent(normalizedId)}`, draft)
    : await apiPost('/api/admin/menu-items', draft);

  return payload?.item ?? null;
}

export async function deleteSupabaseMenuItem(identifier) {
  if (isStaticExport) {
    throw createAdminMenuError('STATIC_MENU_WRITE_UNSUPPORTED', 'La rimozione delle pizze richiede il server admin.');
  }

  const normalizedId = normalizeText(identifier?.id ?? identifier);

  if (!normalizedId) {
    throw createAdminMenuError('INVALID_MENU_ITEM', 'Pizza non valida.');
  }

  const payload = await apiDelete(`/api/admin/menu-items/${encodeURIComponent(normalizedId)}`);
  return payload?.item ?? null;
}
