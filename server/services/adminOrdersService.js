import { getDatabase } from '../db/database.js';
import { getSupabaseAdmin, hasSupabaseConfig } from '../lib/supabase.js';
import { HttpError } from '../utils/httpError.js';
import { assert, normalizeIdentifier, normalizeNullableText, normalizeText } from '../utils/validators.js';

const ORDER_STATUSES = new Set(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'completed', 'cancelled']);

function normalizeNumber(value, fallbackValue = 0) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
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

function normalizeOrderItemCustomization(value) {
  const customization = parseCustomizationValue(value);

  return {
    removedIngredients: normalizeCustomizationEntries(customization.removedIngredients, (ingredient) => {
      const name = normalizeText(ingredient?.name);

      if (!name) {
        return null;
      }

      return {
        ingredientId: normalizeIdentifier(ingredient?.ingredientId ?? ingredient?.id),
        name,
      };
    }),
    addedExtras: normalizeCustomizationEntries(customization.addedExtras, (extra) => {
      const name = normalizeText(extra?.name);

      if (!name) {
        return null;
      }

      return {
        extraIngredientId: normalizeIdentifier(extra?.extraIngredientId ?? extra?.id),
        ingredientId: normalizeIdentifier(extra?.ingredientId),
        name,
        extraPrice: normalizeNumber(extra?.extraPrice),
      };
    }),
    selectedOptions: normalizeCustomizationEntries(customization.selectedOptions, (option) => {
      const optionName = normalizeText(option?.optionName ?? option?.name);

      if (!optionName) {
        return null;
      }

      return {
        optionId: normalizeIdentifier(option?.optionId ?? option?.id),
        groupName: normalizeText(option?.groupName) || 'Opzione',
        groupSlug: normalizeIdentifier(option?.groupSlug),
        optionName,
        priceDelta: normalizeNumber(option?.priceDelta),
      };
    }),
    specialNotes: normalizeNullableText(customization.specialNotes),
  };
}

function normalizeOrderRow(row, items = []) {
  return {
    id: normalizeIdentifier(row.id),
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

function normalizeOrderItemRow(row) {
  return {
    id: normalizeIdentifier(row.id),
    orderId: normalizeIdentifier(row.order_id),
    menuItemId: normalizeIdentifier(row.menu_item_id),
    name: row.item_name_snapshot,
    quantity: Number(row.quantity) || 0,
    finalUnitPrice: normalizeNumber(row.final_unit_price),
    lineTotal: normalizeNumber(row.line_total),
    notes: row.notes,
    customization: normalizeOrderItemCustomization(row.customization_json),
  };
}

async function listSupabaseOrders() {
  const supabase = getSupabaseAdmin();
  const { data: orderRows, error: ordersError } = await supabase
    .from('orders')
    .select(
      'id, order_number, customer_name, customer_phone, customer_email, order_type, address, preferred_time, notes, status, subtotal, delivery_fee, total, created_at, updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (ordersError) {
    throw new HttpError(
      500,
      'SUPABASE_QUERY_FAILED',
      'Non riusciamo a leggere gli ordini ricevuti.',
      ordersError.message,
    );
  }

  const orders = orderRows ?? [];
  const orderIds = orders.map((order) => normalizeIdentifier(order.id)).filter(Boolean);

  if (!orderIds.length) {
    return [];
  }

  const { data: itemRows, error: itemsError } = await supabase
    .from('order_items')
    .select('id, order_id, menu_item_id, item_name_snapshot, quantity, final_unit_price, line_total, customization_json, notes')
    .in('order_id', orderIds)
    .order('created_at', { ascending: true });

  if (itemsError) {
    throw new HttpError(
      500,
      'SUPABASE_QUERY_FAILED',
      'Non riusciamo a leggere i dettagli degli ordini.',
      itemsError.message,
    );
  }

  const itemsByOrderId = new Map();

  (itemRows ?? []).map(normalizeOrderItemRow).forEach((item) => {
    const currentItems = itemsByOrderId.get(item.orderId) ?? [];
    itemsByOrderId.set(item.orderId, [...currentItems, item]);
  });

  return orders.map((order) => normalizeOrderRow(order, itemsByOrderId.get(normalizeIdentifier(order.id)) ?? []));
}

function listSqliteOrders(database) {
  const orders = database
    .prepare(
      `
        select
          id,
          customer_name,
          customer_phone,
          customer_email,
          order_type,
          address,
          preferred_time,
          notes,
          status,
          subtotal,
          delivery_fee,
          total,
          created_at,
          updated_at
        from orders
        order by datetime(created_at) desc
        limit 100
      `,
    )
    .all();

  if (!orders.length) {
    return [];
  }

  const orderIds = orders.map((order) => order.id);
  const placeholders = orderIds.map(() => '?').join(', ');
  const itemRows = database
    .prepare(
      `
        select
          id,
          order_id,
          menu_item_id,
          item_name_snapshot,
          quantity,
          final_unit_price,
          line_total,
          customization_json,
          notes
        from order_items
        where order_id in (${placeholders})
        order by created_at asc, id asc
      `,
    )
    .all(...orderIds);

  const itemsByOrderId = new Map();

  itemRows.map(normalizeOrderItemRow).forEach((item) => {
    const currentItems = itemsByOrderId.get(Number(item.orderId)) ?? [];
    itemsByOrderId.set(Number(item.orderId), [...currentItems, item]);
  });

  return orders.map((order) => normalizeOrderRow(order, itemsByOrderId.get(Number(order.id)) ?? []));
}

async function updateSupabaseOrderStatus(orderId, nextStatus) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .update({ status: nextStatus })
    .eq('id', orderId)
    .select('id')
    .single();

  if (error) {
    throw new HttpError(
      500,
      'SUPABASE_ORDER_UPDATE_FAILED',
      'Non siamo riusciti ad aggiornare lo stato dell ordine.',
      error.message,
    );
  }

  if (!data) {
    throw new HttpError(404, 'ORDER_NOT_FOUND', 'Ordine non trovato.');
  }

  const orders = await listSupabaseOrders();
  return orders.find((order) => order.id === orderId) ?? null;
}

function updateSqliteOrderStatus(orderId, nextStatus, database) {
  const result = database
    .prepare(
      `
        update orders
        set status = ?, updated_at = datetime('now')
        where id = ?
      `,
    )
    .run(nextStatus, Number(orderId));

  if (!result.changes) {
    throw new HttpError(404, 'ORDER_NOT_FOUND', 'Ordine non trovato.');
  }

  const orders = listSqliteOrders(database);
  return orders.find((order) => order.id === String(orderId) || Number(order.id) === Number(orderId)) ?? null;
}

function validateNextStatus(nextStatus) {
  const normalizedStatus = normalizeText(nextStatus).toLowerCase();
  assert(
    ORDER_STATUSES.has(normalizedStatus),
    400,
    'INVALID_ORDER_STATUS',
    'Lo stato ordine richiesto non e valido.',
  );
  return normalizedStatus;
}

export async function listAdminOrders(database) {
  if (hasSupabaseConfig()) {
    return listSupabaseOrders();
  }

  return listSqliteOrders(database ?? getDatabase());
}

export async function updateAdminOrderStatus(orderId, nextStatus, database) {
  const normalizedOrderId = normalizeIdentifier(orderId);
  const normalizedStatus = validateNextStatus(nextStatus);

  assert(normalizedOrderId, 400, 'INVALID_ORDER_ID', 'Ordine non valido.');

  if (hasSupabaseConfig()) {
    return updateSupabaseOrderStatus(normalizedOrderId, normalizedStatus);
  }

  return updateSqliteOrderStatus(normalizedOrderId, normalizedStatus, database ?? getDatabase());
}
