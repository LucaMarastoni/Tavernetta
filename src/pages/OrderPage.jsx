import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartSummary from '../components/cart/CartSummary';
import CheckoutForm from '../components/checkout/CheckoutForm';
import StatusPanel from '../components/StatusPanel';
import { useCart } from '../context/CartContext';
import { restaurant } from '../data/siteContent';
import { OrderApiError, submitOrder } from '../services/orderApi';
import {
  formatPreferredTimeDateTime,
  formatTimeInputValue,
  getMinimumPreferredTime,
  getOrderingWindowEnd,
  getPreferredTimeValidationCode,
  serializePreferredTimeValue,
} from '../../shared/orderTiming.js';
import { getCartLineSummary } from '../utils/cart';
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
    () => formatTimeInputValue(getMinimumPreferredTime(orderDraft.orderType)),
    [orderDraft.orderType],
  );
  const maximumPreferredTime = useMemo(() => formatTimeInputValue(getOrderingWindowEnd()), []);

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
        nextDraft.preferredTime = formatTimeInputValue(getMinimumPreferredTime(nextValue));
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
        {successOrder ? (
          <article className="ordering-success-card">
            <p className="ordering-eyebrow">{restaurant.ordering.successEyebrow}</p>
            <h2>{restaurant.ordering.successTitle}</h2>
            <p>{restaurant.ordering.successBody}</p>

            <div className="ordering-success-summary">
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
              {successOrder.items?.map((item) => {
                const itemSummary = getCartLineSummary(item);

                return (
                  <div key={item.id} className="ordering-success-item">
                    <div className="ordering-success-item-copy">
                      <span>
                        {item.quantity} x {item.name}
                      </span>

                      {itemSummary.length ? (
                        <ul className="ordering-success-item-summary" role="list">
                          {itemSummary.map((entry) => (
                            <li key={entry}>{entry}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    <strong>{formatPrice(item.lineTotal)}</strong>
                  </div>
                );
              })}
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
                maximumPreferredTime={maximumPreferredTime}
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
