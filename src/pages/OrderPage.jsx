import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartSummary from '../components/cart/CartSummary';
import CheckoutForm from '../components/checkout/CheckoutForm';
import StatusPanel from '../components/StatusPanel';
import { useCart } from '../context/CartContext';
import { restaurant } from '../data/siteContent';
import { OrderApiError, submitOrder } from '../services/orderApi';
import {
  formatDateTimeLocalValue,
  formatPreferredTimeDateTime,
  getLeadTimeMinutes,
  getMinimumPreferredTime,
  getPreferredTimeValidationCode,
  serializePreferredTimeValue,
} from '../../shared/orderTiming.js';
import { formatPrice } from '../utils/formatPrice';
import { sanitizeOrderDraft, validateOrderDraft } from '../utils/validators';

function OrderPage() {
  const navigate = useNavigate();
  const {
    clearCart,
    items,
    orderDraft,
    removeItem,
    resetOrderDraft,
    totals,
    updateOrderDraft,
    updateQuantity,
  } = useCart();
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const sanitizedDraft = useMemo(() => sanitizeOrderDraft(orderDraft), [orderDraft]);
  const minimumPreferredTime = useMemo(
    () => formatDateTimeLocalValue(getMinimumPreferredTime(orderDraft.orderType)),
    [orderDraft.orderType],
  );
  const preferredTimeLeadMinutes = useMemo(() => getLeadTimeMinutes(orderDraft.orderType), [orderDraft.orderType]);

  const handleFieldChange = (event) => {
    const { checked, name, type, value } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;
    const nextDraft = {
      ...orderDraft,
      [name]: nextValue,
    };

    if (name === 'orderType' && orderDraft.preferredTime) {
      const validationCode = getPreferredTimeValidationCode(orderDraft.preferredTime, nextValue);

      if (validationCode === 'PREFERRED_TIME_TOO_SOON') {
        nextDraft.preferredTime = formatDateTimeLocalValue(getMinimumPreferredTime(nextValue));
      }
    }

    updateOrderDraft(nextDraft);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
      cart: '',
    }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setFieldErrors({});

    const validation = validateOrderDraft({
      draft: sanitizedDraft,
      items,
    });

    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setSubmitError(validation.message || 'Controlla i dati inseriti.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await submitOrder({
        customer: {
          customerName: sanitizedDraft.customerName,
          customerPhone: sanitizedDraft.customerPhone,
          customerEmail: sanitizedDraft.customerEmail || null,
        },
        order: {
          orderType: sanitizedDraft.orderType,
          address: sanitizedDraft.orderType === 'delivery' ? sanitizedDraft.address : null,
          preferredTime: serializePreferredTimeValue(sanitizedDraft.preferredTime),
          notes: sanitizedDraft.notes || null,
          privacyAccepted: sanitizedDraft.privacyAccepted,
        },
        items: items.map((line) => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          note: line.note || null,
          customization: {
            removedIngredientIds: line.customization?.removedIngredientIds ?? [],
            addedExtraIds: line.customization?.addedExtraIds ?? [],
            selectedOptionIds: line.customization?.selectedOptionIds ?? [],
          },
        })),
      });

      setSuccessOrder({
        ...response,
        customerName: sanitizedDraft.customerName,
        customerPhone: sanitizedDraft.customerPhone,
        orderType: sanitizedDraft.orderType,
        address: sanitizedDraft.address,
        preferredTime: sanitizedDraft.preferredTime,
      });
      clearCart();
      resetOrderDraft();
      setFieldErrors({});
    } catch (error) {
      if (error instanceof OrderApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError('Non siamo riusciti a registrare l ordine. Riprova tra poco.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section ordering-page ordering-page-checkout" data-header-tone="dark">
      <div className="section-inner ordering-page-inner">
        <header className="ordering-hero ordering-hero-checkout">
          <div className="ordering-hero-copy">
            <p className="ordering-eyebrow">{restaurant.orderPage.eyebrow}</p>
            <h1>Ordina</h1>
            <p>
              Rivedi il carrello, conferma il servizio e invia un ordine pronto per la gestione sala. I prezzi finali
              vengono ricalcolati prima del salvataggio.
            </p>
          </div>

          <Link className="ordering-secondary-cta" to="/menu" viewTransition>
            Torna al menu
          </Link>
        </header>

        {successOrder ? (
          <article className="ordering-success-card">
            <p className="ordering-eyebrow">{restaurant.ordering.successEyebrow}</p>
            <h2>{restaurant.ordering.successTitle}</h2>
            <p>{restaurant.ordering.successBody}</p>

            <div className="ordering-success-summary">
              <div>
                <span>Ordine</span>
                <strong>#{successOrder.orderNumber}</strong>
              </div>
              <div>
                <span>Stato</span>
                <strong>{successOrder.status}</strong>
              </div>
              <div>
                <span>Totale</span>
                <strong>{formatPrice(successOrder.total)}</strong>
              </div>
            </div>

            <div className="ordering-success-meta">
              <p>{successOrder.customerName}</p>
              <p>{successOrder.customerPhone}</p>
              <p>{successOrder.orderType === 'delivery' ? 'Consegna' : 'Ritiro'}</p>
              {successOrder.address ? <p>{successOrder.address}</p> : null}
              {successOrder.preferredTime ? (
                <p>{`Orario richiesto: ${formatPreferredTimeDateTime(successOrder.preferredTime)}`}</p>
              ) : null}
            </div>

            <div className="ordering-success-items">
              {successOrder.items?.map((item) => (
                <div key={item.id} className="ordering-success-item">
                  <span>
                    {item.quantity} x {item.name}
                  </span>
                  <strong>{formatPrice(item.lineTotal)}</strong>
                </div>
              ))}
            </div>

            <Link className="ordering-primary-cta" to="/menu" viewTransition>
              Nuovo ordine
            </Link>
          </article>
        ) : items.length === 0 ? (
          <StatusPanel
            title="Il carrello e vuoto."
            message="Aggiungi prima una pizza o un prodotto dal menu, poi torna qui per chiudere l ordine."
            actionLabel="Vai al menu"
            onAction={() => navigate('/menu')}
          />
        ) : (
          <div className="ordering-checkout-layout">
            <div className="ordering-checkout-main">
              {fieldErrors.cart ? <p className="ordering-form-banner">{fieldErrors.cart}</p> : null}

              <CartSummary
                eyebrow="Riepilogo"
                title="Il tuo ordine"
                subtitle="Le varianti restano separate per riga, cosi due pizze simili ma configurate in modo diverso non vengono mai fuse."
                items={items}
                totals={totals}
                emptyTitle="Il carrello e vuoto."
                emptyBody="Seleziona almeno un prodotto dal menu."
                onDecrease={(line) => updateQuantity(line.lineId, line.quantity - 1)}
                onIncrease={(line) => updateQuantity(line.lineId, line.quantity + 1)}
                onRemove={(line) => removeItem(line.lineId)}
                footer={
                  <Link className="ordering-secondary-cta is-full-width" to="/menu" viewTransition>
                    Modifica nel menu
                  </Link>
                }
              />
            </div>

            <div className="ordering-checkout-sidebar">
              <CheckoutForm
                draft={orderDraft}
                fieldErrors={fieldErrors}
                submitError={submitError}
                totals={totals}
                submitting={isSubmitting}
                minimumPreferredTime={minimumPreferredTime}
                preferredTimeLeadMinutes={preferredTimeLeadMinutes}
                onFieldChange={handleFieldChange}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default OrderPage;
