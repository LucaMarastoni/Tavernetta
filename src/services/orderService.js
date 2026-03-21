import { apiPost } from '../lib/apiClient';
import { calculateCartTotals } from '../utils/calculateCartTotals';
import { sanitizeOrderForm, validateOrderForm } from '../utils/validators';

export class OrderValidationError extends Error {
  constructor(message, fieldErrors = {}) {
    super(message);
    this.name = 'OrderValidationError';
    this.fieldErrors = fieldErrors;
  }
}

function mapOrderErrorMessage(message = '') {
  if (message.startsWith('EMPTY_CART')) {
    return 'Il carrello e vuoto. Aggiungi almeno un piatto prima di continuare.';
  }

  if (message.startsWith('INVALID_CUSTOMER_NAME')) {
    return 'Inserisci nome e cognome.';
  }

  if (message.startsWith('INVALID_PHONE')) {
    return 'Inserisci un numero di telefono valido.';
  }

  if (message.startsWith('INVALID_ORDER_TYPE')) {
    return 'Scegli se desideri ritiro o consegna.';
  }

  if (message.startsWith('INVALID_EMAIL')) {
    return 'L email non sembra valida.';
  }

  if (message.startsWith('ADDRESS_REQUIRED')) {
    return 'Per la consegna serve un indirizzo completo.';
  }

  if (message.startsWith('INVALID_QUANTITY')) {
    return 'Controlla le quantita presenti nel carrello.';
  }

  if (message.startsWith('ITEM_UNAVAILABLE')) {
    return 'Uno o piu piatti selezionati non sono piu disponibili.';
  }

  if (message.startsWith('ORDER_CREATE_FAILED')) {
    return 'Non siamo riusciti a registrare l ordine. Riprova tra poco.';
  }

  if (message.startsWith('Failed to fetch')) {
    return 'Il servizio ordini non e raggiungibile in questo momento.';
  }

  return 'Non siamo riusciti a registrare l ordine. Riprova tra poco.';
}

export async function submitGuestOrder({ formData, cartItems, catalogItemsById }) {
  const cleanForm = sanitizeOrderForm(formData);
  const validation = validateOrderForm({
    formData: cleanForm,
    items: cartItems,
    catalogItemsById,
  });

  if (!validation.isValid) {
    throw new OrderValidationError(validation.message || 'Controlla i dati inseriti.', validation.errors);
  }

  const payload = {
    customer: {
      fullName: cleanForm.fullName,
      phone: cleanForm.phone,
      email: cleanForm.email || null,
    },
    order: {
      orderType: cleanForm.orderType,
      address: cleanForm.orderType === 'delivery' ? cleanForm.address : null,
      preferredTime: cleanForm.preferredTime || null,
      notes: cleanForm.notes || null,
    },
    items: cartItems.map((item) => ({
      menuItemId: item.id,
      quantity: item.quantity,
    })),
  };

  let normalizedResult;

  try {
    normalizedResult = await apiPost('/api/orders', payload);
  } catch (error) {
    throw new Error(mapOrderErrorMessage(error.code || error.message || ''));
  }
  const totals = calculateCartTotals(cartItems, cleanForm.orderType);

  return {
    orderId: normalizedResult?.orderId ?? normalizedResult?.order_id ?? null,
    orderNumber: normalizedResult?.orderNumber ?? normalizedResult?.order_id ?? null,
    status: normalizedResult?.status ?? 'pending',
    subtotal: Number(normalizedResult?.subtotal ?? totals.subtotal),
    deliveryFee: Number(normalizedResult?.deliveryFee ?? normalizedResult?.delivery_fee ?? totals.deliveryFee),
    total: Number(normalizedResult?.total ?? totals.total),
    createdAt: normalizedResult?.createdAt ?? normalizedResult?.created_at ?? new Date().toISOString(),
    customerName: cleanForm.fullName,
    customerPhone: cleanForm.phone,
    orderType: cleanForm.orderType,
    address: cleanForm.address,
    preferredTime: cleanForm.preferredTime,
    notes: cleanForm.notes,
    items: cartItems,
  };
}
