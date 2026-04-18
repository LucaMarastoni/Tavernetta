import { getBrowserSupabase, hasBrowserSupabaseConfig } from '../lib/supabaseBrowser';

function createAdminSupabaseError(code, message = code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeId(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeNumber(value, fallbackValue = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

function normalizeNullableText(value) {
  const normalizedValue = typeof value === 'string' ? value.trim() : '';
  return normalizedValue || null;
}

function parseCustomizationValue(value) {
  if (!value) {
    return {};
  }

  if (typeof value === 'object') {
    return value;
  }

  if (typeof value !== 'string') {
    return {};
  }

  try {
    const parsedValue = JSON.parse(value);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  } catch {
    return {};
  }
}

function normalizeCustomizationEntries(value, mapper) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(mapper).filter(Boolean);
}

function mapOrderItemCustomization(value) {
  const customization = parseCustomizationValue(value);

  return {
    removedIngredients: normalizeCustomizationEntries(customization.removedIngredients, (ingredient) => {
      const name = typeof ingredient?.name === 'string' ? ingredient.name.trim() : '';

      if (!name) {
        return null;
      }

      return {
        ingredientId: normalizeId(ingredient?.ingredientId ?? ingredient?.id),
        name,
      };
    }),
    addedExtras: normalizeCustomizationEntries(customization.addedExtras, (extra) => {
      const name = typeof extra?.name === 'string' ? extra.name.trim() : '';

      if (!name) {
        return null;
      }

      return {
        extraIngredientId: normalizeId(extra?.extraIngredientId ?? extra?.id),
        ingredientId: normalizeId(extra?.ingredientId),
        name,
        extraPrice: normalizeNumber(extra?.extraPrice),
      };
    }),
    selectedOptions: normalizeCustomizationEntries(customization.selectedOptions, (option) => {
      const optionName = typeof option?.optionName === 'string' ? option.optionName.trim() : '';

      if (!optionName) {
        return null;
      }

      return {
        optionId: normalizeId(option?.optionId ?? option?.id),
        groupName: (typeof option?.groupName === 'string' ? option.groupName.trim() : '') || 'Opzione',
        groupSlug: normalizeId(option?.groupSlug),
        optionName,
        priceDelta: normalizeNumber(option?.priceDelta),
      };
    }),
    specialNotes: normalizeNullableText(customization.specialNotes),
  };
}

function isMissingSupabaseResource(error) {
  return (
    ['42P01', '42703', 'PGRST116', 'PGRST204', 'PGRST205'].includes(error?.code) ||
    /Could not find/i.test(error?.message || '') ||
    /does not exist/i.test(error?.message || '') ||
    /schema cache/i.test(error?.message || '')
  );
}

function ensureClient() {
  const client = getBrowserSupabase();

  if (!client) {
    throw createAdminSupabaseError(
      'SUPABASE_NOT_CONFIGURED',
      'Supabase non e configurato per l area admin statica.',
    );
  }

  return client;
}

function normalizeAdminSupabaseError(error) {
  if (!error) {
    return createAdminSupabaseError('ADMIN_SUPABASE_FAILED');
  }

  if (isMissingSupabaseResource(error)) {
    return createAdminSupabaseError(
      'ADMIN_PUBLIC_POLICIES_MISSING',
      'Manca la configurazione Supabase pubblica per l area admin. Esegui lo script SQL dedicato.',
    );
  }

  if (error.code === '42501' || /row-level security/i.test(error.message || '')) {
    return createAdminSupabaseError(
      'ADMIN_PUBLIC_POLICIES_MISSING',
      'Le policy pubbliche di Supabase non permettono ancora questa operazione.',
    );
  }

  return createAdminSupabaseError(error.code || 'ADMIN_SUPABASE_FAILED', error.message || 'ADMIN_SUPABASE_FAILED');
}

function mapOrderItemRow(row) {
  return {
    id: normalizeId(row.id),
    orderId: normalizeId(row.order_id),
    menuItemId: normalizeId(row.menu_item_id),
    name: row.item_name_snapshot,
    quantity: Number(row.quantity) || 0,
    finalUnitPrice: normalizeNumber(row.final_unit_price),
    lineTotal: normalizeNumber(row.line_total),
    notes: row.notes,
    customization: mapOrderItemCustomization(row.customization_json),
  };
}

function mapOrderRow(row, items = []) {
  return {
    id: normalizeId(row.id),
    orderNumber: row.order_number ?? null,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    orderType: row.order_type,
    address: row.address,
    preferredTime: row.preferred_time,
    notes: row.notes,
    status: row.status,
    subtotal: normalizeNumber(row.subtotal),
    deliveryFee: normalizeNumber(row.delivery_fee),
    total: normalizeNumber(row.total),
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    items,
  };
}

async function fetchAdminOrderItems(client, orderIds) {
  if (!orderIds.length) {
    return [];
  }

  const { data, error } = await client
    .from('order_items')
    .select('id, order_id, menu_item_id, item_name_snapshot, quantity, final_unit_price, line_total, customization_json, notes')
    .in('order_id', orderIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw normalizeAdminSupabaseError(error);
  }

  return (data ?? []).map(mapOrderItemRow);
}

async function loadAdminOrders(client) {
  const { data: orderRows, error: ordersError } = await client
    .from('orders')
    .select(
      'id, order_number, customer_name, customer_phone, customer_email, order_type, address, preferred_time, notes, status, subtotal, delivery_fee, total, created_at, updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (ordersError) {
    throw normalizeAdminSupabaseError(ordersError);
  }

  const orderIds = (orderRows ?? []).map((row) => normalizeId(row.id)).filter(Boolean);
  const itemRows = await fetchAdminOrderItems(client, orderIds);
  const itemsByOrderId = new Map();

  itemRows.forEach((item) => {
    const currentItems = itemsByOrderId.get(item.orderId) ?? [];
    itemsByOrderId.set(item.orderId, [...currentItems, item]);
  });

  return (orderRows ?? []).map((row) => mapOrderRow(row, itemsByOrderId.get(normalizeId(row.id)) ?? []));
}

export function canUseSupabaseAdminSource() {
  return hasBrowserSupabaseConfig();
}

export async function fetchAdminOrdersFromSupabase() {
  const client = ensureClient();
  return loadAdminOrders(client);
}

export async function updateAdminOrderFromSupabase(orderId, status) {
  const client = ensureClient();
  const { error } = await client
    .from('orders')
    .update({ status })
    .eq('id', normalizeId(orderId))
    .select('id')
    .single();

  if (error) {
    throw normalizeAdminSupabaseError(error);
  }

  const orders = await loadAdminOrders(client);
  return orders.find((order) => order.id === normalizeId(orderId)) ?? null;
}
