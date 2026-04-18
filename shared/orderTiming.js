export const PICKUP_LEAD_MINUTES = 30;
export const DELIVERY_LEAD_MINUTES = 60;
export const ORDER_TIME_STEP_MINUTES = 5;

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function hasSameDateParts(date, year, month, day, hours, minutes) {
  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day &&
    date.getHours() === hours &&
    date.getMinutes() === minutes
  );
}

export function getLeadTimeMinutes(orderType = 'pickup') {
  return orderType === 'delivery' ? DELIVERY_LEAD_MINUTES : PICKUP_LEAD_MINUTES;
}

export function parseDateValue(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function parseDateTimeLocalValue(value) {
  const normalizedValue = String(value || '').trim();
  const match = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);

  if ([year, month, day, hours, minutes].some((value) => !Number.isInteger(value))) {
    return null;
  }

  const parsedDate = new Date(year, month, day, hours, minutes, 0, 0);
  return hasSameDateParts(parsedDate, year, month, day, hours, minutes) ? parsedDate : null;
}

export function parseTimeOnlyValue(value, baseDate = null) {
  const normalizedValue = String(value || '').trim();
  const match = normalizedValue.match(/^(\d{1,2})[:.](\d{2})$/);

  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes > 59) {
    return null;
  }

  const resolvedBaseDate =
    baseDate instanceof Date ? new Date(baseDate) : parseDateValue(baseDate) ?? new Date();

  resolvedBaseDate.setHours(hours, minutes, 0, 0);
  return resolvedBaseDate;
}

export function parsePreferredTimeValue(value, fallbackDateValue = null) {
  const normalizedValue = String(value || '').trim();

  if (!normalizedValue) {
    return null;
  }

  const localDateTimeValue = parseDateTimeLocalValue(normalizedValue);

  if (localDateTimeValue) {
    return localDateTimeValue;
  }

  const parsedDate = parseDateValue(normalizedValue);

  if (parsedDate) {
    return parsedDate;
  }

  return parseTimeOnlyValue(normalizedValue, fallbackDateValue);
}

export function roundDateUp(date, stepMinutes = ORDER_TIME_STEP_MINUTES) {
  const stepMilliseconds = Math.max(1, Number(stepMinutes) || ORDER_TIME_STEP_MINUTES) * 60 * 1000;
  const roundedDate = new Date(date);
  roundedDate.setSeconds(0, 0);
  return new Date(Math.ceil(roundedDate.getTime() / stepMilliseconds) * stepMilliseconds);
}

export function getMinimumPreferredTime(orderType = 'pickup', now = new Date()) {
  const nextDate = new Date(now.getTime() + getLeadTimeMinutes(orderType) * 60 * 1000);
  return roundDateUp(nextDate);
}

export function formatDateTimeLocalValue(value) {
  const resolvedDate = value instanceof Date ? value : parsePreferredTimeValue(value);

  if (!resolvedDate) {
    return '';
  }

  return [
    resolvedDate.getFullYear(),
    padNumber(resolvedDate.getMonth() + 1),
    padNumber(resolvedDate.getDate()),
  ].join('-')
    .concat('T')
    .concat([padNumber(resolvedDate.getHours()), padNumber(resolvedDate.getMinutes())].join(':'));
}

export function serializePreferredTimeValue(value, fallbackDateValue = null) {
  const resolvedDate = parsePreferredTimeValue(value, fallbackDateValue);
  return resolvedDate ? resolvedDate.toISOString() : null;
}

export function getPreferredTimeValidationCode(preferredTime, orderType = 'pickup', now = new Date()) {
  const normalizedValue = String(preferredTime || '').trim();

  if (!normalizedValue) {
    return 'PREFERRED_TIME_REQUIRED';
  }

  const resolvedDate = parsePreferredTimeValue(normalizedValue);

  if (!resolvedDate) {
    return 'INVALID_PREFERRED_TIME';
  }

  if (resolvedDate.getTime() < getMinimumPreferredTime(orderType, now).getTime()) {
    return 'PREFERRED_TIME_TOO_SOON';
  }

  return '';
}

export function isSameLocalDate(leftDate, rightDate) {
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
}

export function isCurrentDayPreferredTime(value, today = new Date(), fallbackDateValue = null) {
  const resolvedDate = parsePreferredTimeValue(value, fallbackDateValue);
  return resolvedDate ? isSameLocalDate(resolvedDate, today) : false;
}

export function formatPreferredTimeClock(value, fallbackDateValue = null, locale = 'it-IT') {
  const resolvedDate = parsePreferredTimeValue(value, fallbackDateValue);

  if (!resolvedDate) {
    return String(value || '').trim() || 'Orario non disponibile';
  }

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(resolvedDate);
}

export function formatPreferredTimeDateTime(value, fallbackDateValue = null, locale = 'it-IT') {
  const resolvedDate = parsePreferredTimeValue(value, fallbackDateValue);

  if (!resolvedDate) {
    return String(value || '').trim() || 'Orario non disponibile';
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(resolvedDate);
}
