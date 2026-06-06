export const DELIVERY_LOW_ORDER_FEE = 2;
export const DELIVERY_HIGH_ORDER_FEE = 1;
export const DELIVERY_DISCOUNT_THRESHOLD = 15;

export function roundCurrency(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function calculateConfiguredUnitPrice({ basePrice = 0, selectedOptions = [], addedExtras = [] }) {
  return roundCurrency(
    Number(basePrice) +
      selectedOptions.reduce((sum, option) => sum + Number(option.priceDelta || 0), 0) +
      addedExtras.reduce((sum, extra) => sum + Number(extra.extraPrice || 0), 0),
  );
}

export function calculateDeliveryFee(subtotal = 0, orderType = 'pickup') {
  const normalizedSubtotal = roundCurrency(subtotal);

  if (orderType !== 'delivery' || normalizedSubtotal <= 0) {
    return 0;
  }

  return normalizedSubtotal > DELIVERY_DISCOUNT_THRESHOLD ? DELIVERY_HIGH_ORDER_FEE : DELIVERY_LOW_ORDER_FEE;
}

export function calculateCartTotals(items, orderType = 'pickup') {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + Number(item.finalUnitPrice || 0) * Number(item.quantity || 0), 0),
  );
  const deliveryFee = calculateDeliveryFee(subtotal, orderType);
  const total = roundCurrency(subtotal + deliveryFee);

  return {
    subtotal,
    deliveryFee,
    total,
  };
}
