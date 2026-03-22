export const DELIVERY_FEE = 5;

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

export function calculateCartTotals(items, orderType = 'pickup') {
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + Number(item.finalUnitPrice || 0) * Number(item.quantity || 0), 0),
  );
  const deliveryFee = items.length > 0 && orderType === 'delivery' ? DELIVERY_FEE : 0;
  const total = roundCurrency(subtotal + deliveryFee);

  return {
    subtotal,
    deliveryFee,
    total,
  };
}
