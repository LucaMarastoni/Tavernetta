import { Link } from 'react-router-dom';
import { ORDER_TIME_STEP_MINUTES, formatTimeInputValue } from '../../../shared/orderTiming.js';
import { formatPrice } from '../../utils/formatPrice';
import { calculateDeliveryFee } from '../../utils/pricing';

function parseTimeToMinutes(value) {
  const match = String(value || '').match(/^(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  return Number(match[1]) * 60 + Number(match[2]);
}

function formatMinutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function buildAvailableTimeOptions(minimumPreferredTime, maximumPreferredTime) {
  const startMinutes = parseTimeToMinutes(minimumPreferredTime);
  const endMinutes = parseTimeToMinutes(maximumPreferredTime);

  if (startMinutes === null || endMinutes === null || startMinutes > endMinutes) {
    return [];
  }

  const options = [];

  for (let currentMinutes = startMinutes; currentMinutes <= endMinutes; currentMinutes += ORDER_TIME_STEP_MINUTES) {
    options.push(formatMinutesToTime(currentMinutes));
  }

  return options;
}

function CheckoutForm({
  draft,
  fieldErrors,
  submitError,
  totals,
  submitting,
  minimumPreferredTime,
  maximumPreferredTime,
  onFieldChange,
  onSubmit,
}) {
  const currentDeliveryFee = calculateDeliveryFee(totals.subtotal, 'delivery');
  const preferredTimeOptions = buildAvailableTimeOptions(minimumPreferredTime, maximumPreferredTime);
  const selectedPreferredTime = formatTimeInputValue(draft.preferredTime);
  const preferredTimeValue = preferredTimeOptions.includes(selectedPreferredTime) ? selectedPreferredTime : '';

  return (
    <form className="ordering-checkout-card" noValidate onSubmit={onSubmit}>
      <div className="ordering-card-heading">
        <p className="ordering-eyebrow">Checkout</p>
        <h2>Dati ordine</h2>
      </div>

      {submitError ? <p className="ordering-form-banner">{submitError}</p> : null}

      <div className="ordering-form-grid">
        <label className="ordering-field">
          <span>Nome e cognome</span>
          <input
            name="customerName"
            type="text"
            placeholder="Es. Giulia Rossi"
            value={draft.customerName}
            onChange={onFieldChange}
          />
          {fieldErrors.customerName ? <small>{fieldErrors.customerName}</small> : null}
        </label>

        <label className="ordering-field">
          <span>Telefono</span>
          <input
            name="customerPhone"
            type="tel"
            placeholder="Es. +39 333 000 0000"
            value={draft.customerPhone}
            onChange={onFieldChange}
          />
          {fieldErrors.customerPhone ? <small>{fieldErrors.customerPhone}</small> : null}
        </label>

        <div className="ordering-field">
          <span>Servizio</span>
          <div className="ordering-choice-grid">
            <label className={`ordering-choice-card ${draft.orderType === 'pickup' ? 'is-selected' : ''}`}>
              <input
                checked={draft.orderType === 'pickup'}
                name="orderType"
                type="radio"
                value="pickup"
                onChange={onFieldChange}
              />
              <span>Ritiro</span>
              <small>Disponibile dopo 15 minuti</small>
            </label>

            <label className={`ordering-choice-card ${draft.orderType === 'delivery' ? 'is-selected' : ''}`}>
              <input
                checked={draft.orderType === 'delivery'}
                name="orderType"
                type="radio"
                value="delivery"
                onChange={onFieldChange}
              />
              <span>Consegna</span>
              <small>Supplemento attuale {formatPrice(currentDeliveryFee)}</small>
            </label>
          </div>
        </div>

        {draft.orderType === 'delivery' ? (
          <label className="ordering-field ordering-field-full">
            <span>Indirizzo</span>
            <textarea
              name="address"
              rows="3"
              placeholder="Via, numero civico, scala, citofono"
              value={draft.address}
              onChange={onFieldChange}
            />
            {fieldErrors.address ? <small>{fieldErrors.address}</small> : null}
          </label>
        ) : null}

        <label className="ordering-field">
          <span>Orario ritiro / consegna di oggi</span>
          <select
            name="preferredTime"
            value={preferredTimeValue}
            onChange={onFieldChange}
            required
            disabled={!preferredTimeOptions.length}
          >
            <option value="">
              {preferredTimeOptions.length ? 'Seleziona orario' : 'Nessun orario disponibile oggi'}
            </option>
            {preferredTimeOptions.map((timeOption) => (
              <option key={timeOption} value={timeOption}>
                {timeOption}
              </option>
            ))}
          </select>
          {fieldErrors.preferredTime ? <small>{fieldErrors.preferredTime}</small> : null}
        </label>

        <label className="ordering-field ordering-field-full">
          <span>Note sull ordine</span>
          <textarea
            name="notes"
            rows="4"
            placeholder="Allergie, dettagli per il ritiro o indicazioni per la consegna"
            value={draft.notes}
            onChange={onFieldChange}
          />
        </label>

        <label className="ordering-consent-check ordering-field-full">
          <input
            checked={draft.privacyAccepted}
            name="privacyAccepted"
            type="checkbox"
            onChange={onFieldChange}
          />
          <span>
            Ho letto e accetto la <Link to="/privacy-policy" viewTransition>privacy policy</Link>.
          </span>
        </label>
        {fieldErrors.privacyAccepted ? <p className="ordering-consent-error">{fieldErrors.privacyAccepted}</p> : null}
      </div>

      <button className="ordering-primary-cta is-full-width" type="submit" disabled={submitting}>
        {submitting ? 'Invio in corso...' : 'Invia ordine'}
      </button>
    </form>
  );
}

export default CheckoutForm;
