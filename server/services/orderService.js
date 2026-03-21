import { getDatabase } from '../db/database.js';
import { calculateCartTotals } from '../utils/calculateTotals.js';
import { HttpError } from '../utils/httpError.js';
import { upsertCustomer } from './customerService.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ORDER_TYPES = new Set(['pickup', 'delivery']);

function sanitizeOrderPayload(payload = {}) {
  const customer = payload.customer ?? {};
  const order = payload.order ?? {};
  const items = Array.isArray(payload.items) ? payload.items : [];

  return {
    customer: {
      fullName: customer.full_name?.trim() || customer.fullName?.trim() || '',
      phone: customer.phone?.replace(/\s+/g, ' ').trim() || '',
      email: customer.email?.trim() || '',
    },
    order: {
      orderType: order.order_type || order.orderType || 'pickup',
      address: order.address?.trim() || '',
      preferredTime: order.preferred_time?.trim() || order.preferredTime?.trim() || '',
      notes: order.notes?.trim() || '',
    },
    items: items.map((item) => ({
      menuItemId: Number(item.menu_item_id ?? item.menuItemId ?? item.id),
      quantity: Number(item.quantity),
    })),
  };
}

function validatePayload(payload) {
  const normalizedPhone = payload.customer.phone.replace(/[^\d+]/g, '');

  if (!payload.items.length) {
    throw new HttpError(400, 'EMPTY_CART', 'Il carrello e vuoto.');
  }

  if (!payload.customer.fullName) {
    throw new HttpError(400, 'INVALID_CUSTOMER_NAME', 'Inserisci nome e cognome.');
  }

  if (!payload.customer.phone || normalizedPhone.length < 7) {
    throw new HttpError(400, 'INVALID_PHONE', 'Inserisci un numero di telefono valido.');
  }

  if (payload.customer.email && !EMAIL_PATTERN.test(payload.customer.email)) {
    throw new HttpError(400, 'INVALID_EMAIL', 'L email non sembra valida.');
  }

  if (!ALLOWED_ORDER_TYPES.has(payload.order.orderType)) {
    throw new HttpError(400, 'INVALID_ORDER_TYPE', 'Scegli se desideri ritiro o consegna.');
  }

  if (payload.order.orderType === 'delivery' && !payload.order.address) {
    throw new HttpError(400, 'ADDRESS_REQUIRED', 'Per la consegna serve un indirizzo completo.');
  }

  if (payload.items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isInteger(item.menuItemId))) {
    throw new HttpError(400, 'INVALID_QUANTITY', 'Controlla le quantita presenti nel carrello.');
  }
}

function fetchLiveMenuItems(itemIds, database) {
  if (!itemIds.length) {
    return [];
  }

  const placeholders = itemIds.map(() => '?').join(', ');

  return database
    .prepare(
      `
        select id, name, price, available
        from menu_items
        where id in (${placeholders})
      `,
    )
    .all(...itemIds);
}

export function createGuestOrder(payload, database = getDatabase()) {
  const cleanPayload = sanitizeOrderPayload(payload);
  validatePayload(cleanPayload);

  const distinctItemIds = [...new Set(cleanPayload.items.map((item) => item.menuItemId))];
  const liveRows = fetchLiveMenuItems(distinctItemIds, database);
  const liveItemsById = new Map(liveRows.map((row) => [row.id, row]));

  const unavailableItem = cleanPayload.items.find((item) => {
    const liveItem = liveItemsById.get(item.menuItemId);
    return !liveItem || !Number(liveItem.available);
  });

  if (unavailableItem) {
    throw new HttpError(400, 'ITEM_UNAVAILABLE', 'Uno o piu piatti selezionati non sono piu disponibili.');
  }

  const orderItems = cleanPayload.items.map((item) => {
    const liveItem = liveItemsById.get(item.menuItemId);

    return {
      id: liveItem.id,
      name: liveItem.name,
      price: Number(liveItem.price),
      quantity: item.quantity,
    };
  });

  const totals = calculateCartTotals(orderItems, cleanPayload.order.orderType);

  const createOrderTransaction = database.transaction(() => {
    const customer = upsertCustomer(cleanPayload.customer, database);
    const orderResult = database
      .prepare(
        `
          insert into orders (
            customer_id,
            order_type,
            status,
            address,
            preferred_time,
            notes,
            subtotal,
            delivery_fee,
            total
          )
          values (?, ?, 'pending', ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        customer.id,
        cleanPayload.order.orderType,
        cleanPayload.order.orderType === 'delivery' ? cleanPayload.order.address : null,
        cleanPayload.order.preferredTime || null,
        cleanPayload.order.notes || null,
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
          unit_price_snapshot,
          quantity,
          line_total
        )
        values (?, ?, ?, ?, ?, ?)
      `,
    );

    orderItems.forEach((item) => {
      insertOrderItem.run(orderId, item.id, item.name, item.price, item.quantity, item.price * item.quantity);
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
    };
  });

  return createOrderTransaction();
}
