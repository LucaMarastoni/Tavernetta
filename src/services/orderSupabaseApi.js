import { getBrowserSupabase, hasBrowserSupabaseConfig } from '../lib/supabaseBrowser';
import { getPreferredTimeValidationCode, serializePreferredTimeValue } from '../../shared/orderTiming.js';
import { DELIVERY_FEE, roundCurrency } from '../utils/pricing';
import { fetchMenuItemCustomizationFromSupabase } from './menuSupabaseApi';

const ALLOWED_ORDER_TYPES = new Set(['pickup', 'delivery']);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function createOrderError(code, message = code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function assert(condition, code, message = code) {
  if (!condition) {
    throw createOrderError(code, message);
  }
}

function normalizeId(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeIdList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((entry) => normalizeId(entry)).filter(Boolean))];
}

function normalizeText(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function normalizeNullableText(value) {
  const normalizedValue = normalizeText(value);
  return normalizedValue || null;
}

function sanitizeOrderPayload(payload = {}) {
  const customer = payload.customer ?? payload;
  const order = payload.order ?? payload;
  const items = Array.isArray(payload.items) ? payload.items : [];

  return {
    customer: {
      name: normalizeText(customer.customerName ?? customer.name),
      phone: normalizeText(customer.customerPhone ?? customer.phone),
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
      menuItemId: normalizeId(item.menuItemId ?? item.menu_item_id),
      quantity: Number(item.quantity),
      note: normalizeNullableText(item.note ?? item.notes),
      customization: {
        removedIngredientIds: normalizeIdList(
          item.customization?.removedIngredientIds ?? item.customization?.removed_ingredient_ids,
        ),
        addedExtraIds: normalizeIdList(item.customization?.addedExtraIds ?? item.customization?.added_extra_ids),
        selectedOptionIds: normalizeIdList(
          item.customization?.selectedOptionIds ?? item.customization?.selected_option_ids,
        ),
      },
    })),
  };
}

function validatePayload(payload) {
  assert(payload.items.length > 0, 'EMPTY_CART');
  assert(Boolean(payload.customer.name), 'INVALID_CUSTOMER_NAME');

  const normalizedPhone = payload.customer.phone.replace(/[^\d+]/g, '');
  assert(normalizedPhone.length >= 7, 'INVALID_PHONE');

  if (payload.customer.email) {
    assert(EMAIL_PATTERN.test(payload.customer.email), 'INVALID_EMAIL');
  }

  assert(ALLOWED_ORDER_TYPES.has(payload.order.orderType), 'INVALID_ORDER_TYPE');
  assert(payload.order.privacyAccepted, 'PRIVACY_CONSENT_REQUIRED');

  if (payload.order.orderType === 'delivery') {
    assert(Boolean(payload.order.address), 'ADDRESS_REQUIRED');
  }

  const preferredTimeValidationCode = getPreferredTimeValidationCode(payload.order.preferredTime, payload.order.orderType);

  switch (preferredTimeValidationCode) {
    case 'PREFERRED_TIME_REQUIRED':
      assert(false, 'PREFERRED_TIME_REQUIRED');
      break;
    case 'INVALID_PREFERRED_TIME':
      assert(false, 'INVALID_PREFERRED_TIME');
      break;
    case 'PREFERRED_TIME_TOO_SOON':
      assert(false, 'PREFERRED_TIME_TOO_SOON');
      break;
    default:
      break;
  }

  payload.items.forEach((item) => {
    assert(Boolean(item.menuItemId), 'INVALID_MENU_ITEM');
    assert(Number.isInteger(item.quantity) && item.quantity >= 1, 'INVALID_QUANTITY');
  });
}

function selectOptions(optionGroups, selectedOptionIds) {
  const requestedIds = new Set(normalizeIdList(selectedOptionIds));
  const selectedOptions = [];

  optionGroups.forEach((group) => {
    const selectedInGroup = group.options.filter((option) => requestedIds.has(String(option.id)));

    selectedInGroup.forEach((option) => {
      requestedIds.delete(String(option.id));
    });

    const defaultSelections =
      group.selectionType === 'multiple'
        ? group.options.filter((option) => option.isDefault)
        : group.options.find((option) => option.isDefault)
          ? [group.options.find((option) => option.isDefault)]
          : [];

    const fallbackSelections =
      !defaultSelections.length && group.required && group.minSelections > 0
        ? group.options.slice(0, group.minSelections)
        : defaultSelections;

    const resolvedSelections = selectedInGroup.length ? selectedInGroup : fallbackSelections;
    const maxSelections = group.selectionType === 'single' ? 1 : group.maxSelections ?? group.options.length;
    const minSelections = group.minSelections ?? 0;

    assert(group.selectionType !== 'single' || resolvedSelections.length <= 1, 'INVALID_OPTION_SELECTION');
    assert(resolvedSelections.length >= minSelections, 'INVALID_OPTION_SELECTION');
    assert(resolvedSelections.length <= maxSelections, 'INVALID_OPTION_SELECTION');

    resolvedSelections.forEach((option) => {
      selectedOptions.push({
        optionId: String(option.id),
        groupName: option.groupName ?? group.name,
        groupSlug: option.groupSlug ?? group.slug,
        optionName: option.optionName,
        priceDelta: Number(option.priceDelta || 0),
      });
    });
  });

  assert(requestedIds.size === 0, 'INVALID_OPTION_SELECTION');

  return selectedOptions;
}

function getConfigurationLoader() {
  const configurationByItemId = new Map();

  return async (menuItemId) => {
    const normalizedMenuItemId = normalizeId(menuItemId);

    if (!configurationByItemId.has(normalizedMenuItemId)) {
      configurationByItemId.set(normalizedMenuItemId, fetchMenuItemCustomizationFromSupabase(normalizedMenuItemId));
    }

    return configurationByItemId.get(normalizedMenuItemId);
  };
}

async function buildOrderLine(item, loadConfiguration) {
  const configuration = await loadConfiguration(item.menuItemId);
  const removedIngredientIds = normalizeIdList(item.customization?.removedIngredientIds);
  const addedExtraIds = normalizeIdList(item.customization?.addedExtraIds);
  const selectedOptionIds = normalizeIdList(item.customization?.selectedOptionIds);

  const removableIngredientsById = new Map(
    configuration.removableIngredients.map((ingredient) => [String(ingredient.ingredientId), ingredient]),
  );
  const allowedExtrasById = new Map(configuration.allowedExtras.map((extra) => [String(extra.id), extra]));

  const removedIngredients = removedIngredientIds.map((ingredientId) => {
    const ingredient = removableIngredientsById.get(ingredientId);

    assert(Boolean(ingredient), 'INVALID_REMOVED_INGREDIENT');

    return {
      ingredientId: ingredient.ingredientId,
      name: ingredient.name,
    };
  });

  const addedExtras = addedExtraIds.map((extraId) => {
    const extra = allowedExtrasById.get(extraId);

    assert(Boolean(extra), 'INVALID_EXTRA_SELECTION');

    return {
      extraIngredientId: extra.id,
      ingredientId: extra.ingredientId,
      name: extra.name,
      extraPrice: Number(extra.extraPrice || 0),
    };
  });

  const selectedOptions = selectOptions(configuration.optionGroups, selectedOptionIds);
  const basePrice = Number(configuration.item.basePrice || 0);
  const finalUnitPrice = roundCurrency(
    basePrice +
      selectedOptions.reduce((sum, option) => sum + Number(option.priceDelta || 0), 0) +
      addedExtras.reduce((sum, extra) => sum + Number(extra.extraPrice || 0), 0),
  );

  return {
    menuItemId: configuration.item.id,
    itemNameSnapshot: configuration.item.name,
    basePriceSnapshot: basePrice,
    finalUnitPrice,
    quantity: item.quantity,
    lineTotal: roundCurrency(finalUnitPrice * item.quantity),
    notes: item.note || null,
    customization: {
      removedIngredients,
      addedExtras,
      selectedOptions,
      defaultIngredients: configuration.defaultIngredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId,
        name: ingredient.name,
        isRemovable: Boolean(ingredient.isRemovable),
      })),
      specialNotes: item.note || null,
    },
  };
}

function calculateOrderTotals(lines, orderType = 'pickup') {
  const subtotal = roundCurrency(lines.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0));
  const deliveryFee = orderType === 'delivery' && lines.length > 0 ? DELIVERY_FEE : 0;
  const total = roundCurrency(subtotal + deliveryFee);

  return {
    subtotal,
    deliveryFee,
    total,
  };
}

function normalizeRpcError(error) {
  if (error?.code === 'PGRST202') {
    return createOrderError(
      'ORDER_RPC_NOT_DEPLOYED',
      'La funzione ordini su Supabase non e disponibile. Pubblica prima lo script SQL dedicato.',
    );
  }

  if (error?.code === 'P0001' && error?.message) {
    return createOrderError(error.message, error.message);
  }

  if (
    error?.code === '42804' ||
    /preferred_time/i.test(error?.message || '') ||
    /timestamp with time zone/i.test(error?.message || '')
  ) {
    return createOrderError(
      'SUPABASE_ORDER_RPC_OUTDATED',
      'La funzione ordini su Supabase e da aggiornare. Riesegui lo script SQL piu recente.',
    );
  }

  if (/row-level security policy/i.test(error?.message || '')) {
    return createOrderError(
      'SUPABASE_ORDER_RPC_BLOCKED',
      'Supabase sta bloccando il salvataggio dell ordine. Controlla la funzione SQL pubblica.',
    );
  }

  const nextError = createOrderError(error?.code || 'SUPABASE_ORDER_CREATE_FAILED', error?.message || 'ORDER_SUBMIT_FAILED');
  nextError.details = error?.details || null;
  return nextError;
}

function buildRpcPayload(cleanPayload, orderLines, totals) {
  return {
    customer: cleanPayload.customer,
    order: {
      ...cleanPayload.order,
      preferredTime: serializePreferredTimeValue(cleanPayload.order.preferredTime),
    },
    totals,
    items: orderLines.map((line) => ({
      menuItemId: line.menuItemId,
      itemNameSnapshot: line.itemNameSnapshot,
      basePriceSnapshot: line.basePriceSnapshot,
      finalUnitPrice: line.finalUnitPrice,
      quantity: line.quantity,
      lineTotal: line.lineTotal,
      customization: line.customization,
      notes: line.notes,
    })),
  };
}

function mapRpcResponse(response, orderLines) {
  return {
    orderId: response.orderId,
    orderNumber: response.orderNumber ?? String(response.orderId).slice(0, 8).toUpperCase(),
    status: response.status ?? 'pending',
    subtotal: Number(response.subtotal),
    deliveryFee: Number(response.deliveryFee),
    total: Number(response.total),
    createdAt: response.createdAt,
    items: orderLines.map((line, index) => ({
      id: `${response.orderId}-${index + 1}`,
      menuItemId: line.menuItemId,
      name: line.itemNameSnapshot,
      quantity: line.quantity,
      finalUnitPrice: line.finalUnitPrice,
      lineTotal: line.lineTotal,
      customization: line.customization,
    })),
  };
}

export function canUseSupabaseOrderSource() {
  return hasBrowserSupabaseConfig();
}

export async function submitOrderToSupabase(payload) {
  const client = getBrowserSupabase();

  assert(Boolean(client), 'SUPABASE_NOT_CONFIGURED');

  const cleanPayload = sanitizeOrderPayload(payload);
  validatePayload(cleanPayload);

  const loadConfiguration = getConfigurationLoader();
  const orderLines = await Promise.all(cleanPayload.items.map((item) => buildOrderLine(item, loadConfiguration)));
  const totals = calculateOrderTotals(orderLines, cleanPayload.order.orderType);
  const rpcPayload = buildRpcPayload(cleanPayload, orderLines, totals);
  const { data, error } = await client.rpc('create_public_order', { payload: rpcPayload });

  if (error) {
    throw normalizeRpcError(error);
  }

  const response = typeof data === 'string' ? JSON.parse(data) : data;

  assert(response?.orderId, 'SUPABASE_ORDER_CREATE_FAILED');

  return mapRpcResponse(response, orderLines);
}
