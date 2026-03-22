import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

function CheckoutForm({ draft, fieldErrors, submitError, totals, submitting, onFieldChange, onSubmit }) {
  return (
    <form className="ordering-checkout-card" noValidate onSubmit={onSubmit}>
      <div className="ordering-card-heading">
        <p className="ordering-eyebrow">Checkout</p>
        <h2>Dati ordine</h2>
        <p>Conferma i dettagli del servizio e lascia al server il ricalcolo finale dell ordine.</p>
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

        <label className="ordering-field">
          <span>Email</span>
          <input
            name="customerEmail"
            type="email"
            placeholder="Facoltativa"
            value={draft.customerEmail}
            onChange={onFieldChange}
          />
          {fieldErrors.customerEmail ? <small>{fieldErrors.customerEmail}</small> : null}
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
              <small>Pronto in circa 25-35 minuti</small>
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
              <small>Supplemento attuale {formatPrice(totals.deliveryFee || 5)}</small>
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
          <span>Orario preferito</span>
          <input
            name="preferredTime"
            type="text"
            placeholder="Es. 20:30"
            value={draft.preferredTime}
            onChange={onFieldChange}
          />
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
