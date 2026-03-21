const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeOrderForm(formData) {
  return {
    fullName: formData.fullName?.trim() || '',
    phone: formData.phone?.replace(/\s+/g, ' ').trim() || '',
    email: formData.email?.trim() || '',
    orderType: formData.orderType || 'pickup',
    address: formData.address?.trim() || '',
    preferredTime: formData.preferredTime?.trim() || '',
    notes: formData.notes?.trim() || '',
  };
}

export function validateOrderForm({ formData, items, catalogItemsById = {} }) {
  const errors = {};
  const normalizedPhone = formData.phone.replace(/[^\d+]/g, '');

  if (!items.length) {
    errors.cart = 'Aggiungi almeno un piatto prima di confermare l ordine.';
  }

  if (!formData.fullName) {
    errors.fullName = 'Inserisci nome e cognome.';
  }

  if (!formData.phone) {
    errors.phone = 'Inserisci un numero di telefono.';
  } else if (normalizedPhone.length < 7) {
    errors.phone = 'Inserisci un telefono valido.';
  }

  if (formData.email && !EMAIL_PATTERN.test(formData.email)) {
    errors.email = 'L email non sembra valida.';
  }

  if (!['pickup', 'delivery'].includes(formData.orderType)) {
    errors.orderType = 'Scegli se desideri ritiro o consegna.';
  }

  if (formData.orderType === 'delivery' && !formData.address) {
    errors.address = 'Per la consegna serve un indirizzo completo.';
  }

  if (items.some((item) => Number(item.quantity) <= 0)) {
    errors.cart = 'Controlla le quantita presenti nel carrello.';
  }

  const unavailableItem = items.find((item) => {
    const liveItem = catalogItemsById[String(item.id)];
    return !liveItem || liveItem.available === false;
  });

  if (unavailableItem) {
    errors.cart = 'Uno o piu piatti selezionati non sono piu disponibili.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    message: errors.cart || Object.values(errors)[0] || '',
  };
}
