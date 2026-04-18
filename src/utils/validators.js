import { getLeadTimeMinutes, getMinimumPreferredTime, getPreferredTimeValidationCode } from '../../shared/orderTiming.js';

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

export function normalizeOrderDraft(draft = {}) {
  return {
    customerName: typeof draft.customerName === 'string' ? draft.customerName : '',
    customerPhone: typeof draft.customerPhone === 'string' ? draft.customerPhone : '',
    customerEmail: typeof draft.customerEmail === 'string' ? draft.customerEmail : '',
    orderType: draft.orderType === 'delivery' ? 'delivery' : 'pickup',
    address: typeof draft.address === 'string' ? draft.address : '',
    preferredTime: typeof draft.preferredTime === 'string' ? draft.preferredTime : '',
    notes: typeof draft.notes === 'string' ? draft.notes : '',
    privacyAccepted: Boolean(draft.privacyAccepted),
  };
}

export function sanitizeOrderDraft(draft = {}) {
  const normalizedDraft = normalizeOrderDraft(draft);

  return {
    customerName: normalizedDraft.customerName.trim(),
    customerPhone: normalizedDraft.customerPhone.replace(/\s+/g, ' ').trim(),
    customerEmail: normalizedDraft.customerEmail.trim(),
    orderType: normalizedDraft.orderType,
    address: normalizedDraft.address.trim(),
    preferredTime: normalizedDraft.preferredTime.trim(),
    notes: normalizedDraft.notes.trim(),
    privacyAccepted: normalizedDraft.privacyAccepted,
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

  const preferredTimeValidationCode = getPreferredTimeValidationCode(draft.preferredTime, draft.orderType);

  switch (preferredTimeValidationCode) {
    case 'PREFERRED_TIME_REQUIRED':
      errors.preferredTime = 'Seleziona l orario desiderato.';
      break;
    case 'INVALID_PREFERRED_TIME':
      errors.preferredTime = 'L orario selezionato non e valido.';
      break;
    case 'PREFERRED_TIME_TOO_SOON': {
      const minimumDate = getMinimumPreferredTime(draft.orderType);
      const leadTimeMinutes = getLeadTimeMinutes(draft.orderType);
      const minimumLabel = new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }).format(minimumDate);

      errors.preferredTime = `Scegli un orario almeno ${leadTimeMinutes} minuti dopo adesso (${minimumLabel}).`;
      break;
    }
    default:
      break;
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
