import { getDatabase } from '../db/database.js';
import { getSupabaseAdmin, hasSupabaseConfig } from '../lib/supabase.js';
import { getPreferredTimeValidationCode, serializePreferredTimeValue } from '../../shared/orderTiming.js';
import { calculateOrderTotals, buildOrderLine } from './pricingService.js';
import {
  assert,
  assertEmail,
  assertPhone,
  normalizeIdentifier,
  normalizeNullableText,
  normalizePhone,
  normalizeText,
} from '../utils/validators.js';
import { HttpError } from '../utils/httpError.js';

const ALLOWED_ORDER_TYPES = new Set(['pickup', 'delivery']);
const MISSING_RESOURCE_CODES = new Set(['42703', 'PGRST204', 'PGRST205', '42P01']);

function sanitizeOrderPayload(payload = {}) {
  const customer = payload.customer ?? payload;
  const order = payload.order ?? payload;
  const items = Array.isArray(payload.items) ? payload.items : [];

  return {
    customer: {
      name: normalizeText(customer.customerName ?? customer.name),
      phone: normalizePhone(customer.customerPhone ?? customer.phone),
      email: normalizeNullableText(customer.customerEmail ?? customer.email),
    },
    order: {
      orderType: normalizeText(order.orderType) || 'pickup',
      address: normalizeNullableText(order.address),
      preferredTime: normalizeNullableText(order.preferredTime),
      notes: normalizeNullableText(order.notes),
      privacyAccepted: Boolean(order.privacyAccepted),
    },
    items: items.map((item) => ({
      menuItemId: normalizeIdentifier(item.menuItemId ?? item.menu_item_id),
      quantity: Number(item.quantity),
      note: normalizeNullableText(item.note ?? item.notes),
      customization: {
        removedIngredientIds: item.customization?.removedIngredientIds ?? item.customization?.removed_ingredient_ids,
        addedExtraIds: item.customization?.addedExtraIds ?? item.customization?.added_extra_ids,
        selectedOptionIds: item.customization?.selectedOptionIds ?? item.customization?.selected_option_ids,
      },
    })),
  };
}

function validatePayload(payload) {
  assert(payload.items.length > 0, 400, 'EMPTY_CART', 'Il carrello e vuoto.');
  assert(payload.customer.name, 400, 'INVALID_CUSTOMER_NAME', 'Inserisci nome e cognome.');
  assertPhone(payload.customer.phone);
  assertEmail(payload.customer.email);
  assert(
    ALLOWED_ORDER_TYPES.has(payload.order.orderType),
    400,
    'INVALID_ORDER_TYPE',
    'Scegli se desideri ritiro o consegna.',
  );
  assert(
    payload.order.privacyAccepted,
    400,
    'PRIVACY_CONSENT_REQUIRED',
    'Per inviare l ordine devi accettare la privacy policy.',
  );

  if (payload.order.orderType === 'delivery') {
    assert(payload.order.address, 400, 'ADDRESS_REQUIRED', 'Per la consegna serve un indirizzo completo.');
  }

  const preferredTimeValidationCode = getPreferredTimeValidationCode(payload.order.preferredTime, payload.order.orderType);

  switch (preferredTimeValidationCode) {
    case 'PREFERRED_TIME_REQUIRED':
      throw new HttpError(400, 'PREFERRED_TIME_REQUIRED', 'Seleziona l orario desiderato per ritiro o consegna.');
    case 'INVALID_PREFERRED_TIME':
      throw new HttpError(400, 'INVALID_PREFERRED_TIME', 'L orario selezionato non e valido.');
    case 'PREFERRED_TIME_TOO_SOON':
      throw new HttpError(
        400,
        'PREFERRED_TIME_TOO_SOON',
        'L orario scelto e troppo vicino. Seleziona un orario piu avanti.',
      );
    default:
      break;
  }

  payload.items.forEach((item) => {
    assert(item.menuItemId, 400, 'INVALID_MENU_ITEM', 'Controlla i prodotti nel carrello.');
    assert(
      Number.isInteger(item.quantity) && item.quantity >= 1,
      400,
      'INVALID_QUANTITY',
      'Controlla le quantita presenti nel carrello.',
    );
  });
}

function isMissingSupabaseResource(error) {
  return MISSING_RESOURCE_CODES.has(error?.code) || /Could not find/i.test(error?.message || '');
}

function normalizeSupabasePreferredTimeAndNotes(order) {
  const preferredTime = serializePreferredTimeValue(order.preferredTime);
  const notes = normalizeNullableText(order.notes);

  return {
    preferredTime,
    notes,
  };
}

function mapOrderResponse(savedOrder, orderLines, createdItemIds = []) {
  return {
    orderId: savedOrder.id,
    orderNumber: savedOrder.order_number ?? savedOrder.id,
    status: savedOrder.status,
    subtotal: Number(savedOrder.subtotal),
    deliveryFee: Number(savedOrder.delivery_fee),
    total: Number(savedOrder.total),
    createdAt: savedOrder.created_at,
    items: orderLines.map((line, index) => ({
      id: createdItemIds[index] ?? `${savedOrder.id}-${index + 1}`,
      menuItemId: line.menuItemId,
      name: line.itemNameSnapshot,
      quantity: line.quantity,
      finalUnitPrice: line.finalUnitPrice,
      lineTotal: line.lineTotal,
      customization: line.customization,
    })),
  };
}

async function loadSupabaseCreatedOrder(supabase, orderId, fallbackOrder) {
  const primarySelection = await supabase
    .from('orders')
    .select('id, order_number, status, subtotal, delivery_fee, total, created_at')
    .eq('id', orderId)
    .single();

  if (!primarySelection.error) {
    return primarySelection.data;
  }

  if (!isMissingSupabaseResource(primarySelection.error)) {
    throw new HttpError(
      500,
      'SUPABASE_QUERY_FAILED',
      'L ordine e stato creato ma non riusciamo a rileggerlo.',
      primarySelection.error.message,
    );
  }

  return fallbackOrder;
}

async function createOrderSupabase(cleanPayload, orderLines, totals) {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const normalizedOrder = normalizeSupabasePreferredTimeAndNotes(cleanPayload.order);

  const { data: insertedOrder, error: orderInsertError } = await supabase
    .from('orders')
    .insert({
      customer_name: cleanPayload.customer.name,
      customer_phone: cleanPayload.customer.phone,
      customer_email: cleanPayload.customer.email,
      privacy_accepted_at: now,
      order_type: cleanPayload.order.orderType,
      address: cleanPayload.order.orderType === 'delivery' ? cleanPayload.order.address : null,
      preferred_time: normalizedOrder.preferredTime,
      notes: normalizedOrder.notes,
      status: 'pending',
      subtotal: totals.subtotal,
      delivery_fee: totals.deliveryFee,
      total: totals.total,
    })
    .select('id, status, subtotal, delivery_fee, total, created_at')
    .single();

  if (orderInsertError || !insertedOrder) {
    throw new HttpError(
      500,
      'SUPABASE_ORDER_CREATE_FAILED',
      'Non siamo riusciti a registrare l ordine.',
      orderInsertError?.message || null,
    );
  }

  const orderItemsPayload = orderLines.map((line) => ({
    order_id: insertedOrder.id,
    menu_item_id: line.menuItemId || null,
    item_name_snapshot: line.itemNameSnapshot,
    base_price_snapshot: line.basePriceSnapshot,
    final_unit_price: line.finalUnitPrice,
    quantity: line.quantity,
    line_total: line.lineTotal,
    customization_json: line.customization,
    notes: line.notes,
  }));

  const { data: insertedItems, error: orderItemsInsertError } = await supabase
    .from('order_items')
    .insert(orderItemsPayload)
    .select('id');

  if (orderItemsInsertError) {
    await supabase.from('order_items').delete().eq('order_id', insertedOrder.id);
    await supabase.from('orders').delete().eq('id', insertedOrder.id);

    throw new HttpError(
      500,
      'SUPABASE_ORDER_CREATE_FAILED',
      'Non siamo riusciti a registrare l ordine.',
      orderItemsInsertError.message,
    );
  }

  const savedOrder = await loadSupabaseCreatedOrder(supabase, insertedOrder.id, insertedOrder);

  return mapOrderResponse(
    savedOrder,
    orderLines,
    (insertedItems ?? []).map((item) => item.id),
  );
}

function createOrderSqlite(cleanPayload, orderLines, totals, database) {
  const transaction = database.transaction(() => {
    const orderResult = database
      .prepare(
        `
          insert into orders (
            customer_name,
            customer_phone,
            customer_email,
            privacy_accepted_at,
            order_type,
            address,
            preferred_time,
            notes,
            status,
            subtotal,
            delivery_fee,
            total
          )
          values (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)
        `,
      )
      .run(
        cleanPayload.customer.name,
        cleanPayload.customer.phone,
        cleanPayload.customer.email,
        new Date().toISOString(),
        cleanPayload.order.orderType,
        cleanPayload.order.orderType === 'delivery' ? cleanPayload.order.address : null,
        serializePreferredTimeValue(cleanPayload.order.preferredTime),
        cleanPayload.order.notes,
        totals.subtotal,
        totals.deliveryFee,
        totals.total,
      );

    const orderId = Number(orderResult.lastInsertRowid);
    const insertOrderItem = database.prepare(
      `
        insert into order_items (
          order_id,
          menu_item_id,
          item_name_snapshot,
          base_price_snapshot,
          final_unit_price,
          quantity,
          line_total,
          customization_json,
          notes
        )
        values (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    );

    orderLines.forEach((line) => {
      insertOrderItem.run(
        orderId,
        Number(line.menuItemId),
        line.itemNameSnapshot,
        line.basePriceSnapshot,
        line.finalUnitPrice,
        line.quantity,
        line.lineTotal,
        JSON.stringify(line.customization),
        line.notes,
      );
    });

    const savedOrder = database
      .prepare(
        `
          select id, status, subtotal, delivery_fee, total, created_at
          from orders
          where id = ?
        `,
      )
      .get(orderId);

    return mapOrderResponse(savedOrder, orderLines);
  });

  return transaction();
}

export async function createOrder(payload, database = getDatabase()) {
  const cleanPayload = sanitizeOrderPayload(payload);
  validatePayload(cleanPayload);

  const orderLines = await Promise.all(
    cleanPayload.items.map((item) =>
      buildOrderLine(item.menuItemId, item.quantity, item.note, item.customization, database),
    ),
  );
  const totals = calculateOrderTotals(orderLines, cleanPayload.order.orderType);

  if (hasSupabaseConfig()) {
    return createOrderSupabase(cleanPayload, orderLines, totals);
  }

  return createOrderSqlite(cleanPayload, orderLines, totals, database);
}
