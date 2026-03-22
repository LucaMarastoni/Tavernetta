import { getDatabase } from '../db/database.js';
import { calculateOrderTotals, buildOrderLine } from './pricingService.js';
import { assert, assertEmail, assertPhone, normalizeNullableText, normalizePhone, normalizeText } from '../utils/validators.js';

const ALLOWED_ORDER_TYPES = new Set(['pickup', 'delivery']);

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
      menuItemId: Number(item.menuItemId ?? item.menu_item_id),
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

  payload.items.forEach((item) => {
    assert(Number.isInteger(item.menuItemId), 400, 'INVALID_MENU_ITEM', 'Controlla i prodotti nel carrello.');
    assert(
      Number.isInteger(item.quantity) && item.quantity >= 1,
      400,
      'INVALID_QUANTITY',
      'Controlla le quantita presenti nel carrello.',
    );
  });
}

export function createOrder(payload, database = getDatabase()) {
  const cleanPayload = sanitizeOrderPayload(payload);
  validatePayload(cleanPayload);

  const orderLines = cleanPayload.items.map((item) =>
    buildOrderLine(item.menuItemId, item.quantity, item.note, item.customization, database),
  );
  const totals = calculateOrderTotals(orderLines, cleanPayload.order.orderType);

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
        cleanPayload.order.preferredTime,
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
        line.menuItemId,
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

    return {
      orderId: savedOrder.id,
      orderNumber: savedOrder.id,
      status: savedOrder.status,
      subtotal: Number(savedOrder.subtotal),
      deliveryFee: Number(savedOrder.delivery_fee),
      total: Number(savedOrder.total),
      createdAt: savedOrder.created_at,
      items: orderLines.map((line, index) => ({
        id: `${orderId}-${index + 1}`,
        menuItemId: line.menuItemId,
        name: line.itemNameSnapshot,
        quantity: line.quantity,
        finalUnitPrice: line.finalUnitPrice,
        lineTotal: line.lineTotal,
        customization: line.customization,
      })),
    };
  });

  return transaction();
}
