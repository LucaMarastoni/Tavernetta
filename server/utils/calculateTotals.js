export const DELIVERY_FEE = 5;

export function calculateCartTotals(items, orderType = 'pickup') {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const deliveryFee = items.length > 0 && orderType === 'delivery' ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  return {
    subtotal,
    deliveryFee,
    total,
  };
}
