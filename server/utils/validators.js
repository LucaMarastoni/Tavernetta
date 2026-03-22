import { HttpError } from './httpError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeNullableText(value) {
  const normalizedValue = normalizeText(value);
  return normalizedValue || null;
}

export function normalizePhone(value) {
  return normalizeText(value).replace(/\s+/g, ' ');
}

export function normalizeIntegerList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map((entry) => Number(entry)).filter(Number.isInteger))];
}

export function assert(condition, status, code, message, details = null) {
  if (!condition) {
    throw new HttpError(status, code, message, details);
  }
}

export function assertEmail(email) {
  if (!email) {
    return;
  }

  assert(EMAIL_PATTERN.test(email), 400, 'INVALID_EMAIL', 'L email non sembra valida.');
}

export function assertPhone(phone) {
  const numericPhone = phone.replace(/[^\d+]/g, '');
  assert(numericPhone.length >= 7, 400, 'INVALID_PHONE', 'Inserisci un numero di telefono valido.');
}
