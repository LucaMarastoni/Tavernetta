const euroFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
});

export function formatPrice(value) {
  return euroFormatter.format(Number(value) || 0);
}
