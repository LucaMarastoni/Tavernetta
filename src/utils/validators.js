const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const initialOrderDraft = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  orderType: 'pickup',
  address: '',
  preferredTime: '',
  notes: '',
  privacyAccepted: false,
};

export function sanitizeOrderDraft(draft = {}) {
  return {
    customerName: draft.customerName?.trim() || '',
    customerPhone: draft.customerPhone?.replace(/\s+/g, ' ').trim() || '',
    customerEmail: draft.customerEmail?.trim() || '',
    orderType: draft.orderType === 'delivery' ? 'delivery' : 'pickup',
    address: draft.address?.trim() || '',
    preferredTime: draft.preferredTime?.trim() || '',
    notes: draft.notes?.trim() || '',
    privacyAccepted: Boolean(draft.privacyAccepted),
  };
}

export function validateOrderDraft({ draft, items }) {
  const errors = {};
  const normalizedPhone = draft.customerPhone.replace(/[^\d+]/g, '');

  if (!items.length) {
    errors.cart = 'Aggiungi almeno un prodotto prima di continuare.';
  }

  if (items.some((item) => Number(item.quantity) < 1)) {
    errors.cart = 'Controlla le quantita presenti nel carrello.';
  }

  if (!draft.customerName) {
    errors.customerName = 'Inserisci nome e cognome.';
  }

  if (!draft.customerPhone) {
    errors.customerPhone = 'Inserisci un numero di telefono.';
  } else if (normalizedPhone.length < 7) {
    errors.customerPhone = 'Inserisci un numero di telefono valido.';
  }

  if (draft.customerEmail && !EMAIL_PATTERN.test(draft.customerEmail)) {
    errors.customerEmail = 'L email non sembra valida.';
  }

  if (draft.orderType === 'delivery' && !draft.address) {
    errors.address = 'Per la consegna serve un indirizzo completo.';
  }

  if (!draft.privacyAccepted) {
    errors.privacyAccepted = 'Per proseguire devi accettare la privacy policy.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    message: errors.cart || Object.values(errors)[0] || '',
  };
}
