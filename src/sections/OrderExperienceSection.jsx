import { useMemo, useState } from 'react';
import Button from '../components/Button';
import MenuCatalogSkeleton from '../components/MenuCatalogSkeleton';
import QuantityControl from '../components/QuantityControl';
import Reveal from '../components/Reveal';
import SectionTitle from '../components/SectionTitle';
import StatusPanel from '../components/StatusPanel';
import { useCart } from '../context/CartContext';
import { restaurant } from '../data/siteContent';
import { OrderValidationError, submitGuestOrder } from '../services/orderService';
import { calculateCartTotals } from '../utils/calculateCartTotals';
import { formatPrice } from '../utils/formatPrice';

const initialFormState = {
  fullName: '',
  phone: '',
  email: '',
  orderType: 'pickup',
  address: '',
  preferredTime: '',
  notes: '',
};

function OrderExperienceSection({ categories, featuredItems, itemsById, loading, error, onRetry }) {
  const { addItem, clearCart, getItemQuantity, items, removeItem, updateQuantity } = useCart();
  const [formData, setFormData] = useState(initialFormState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const totals = useMemo(() => calculateCartTotals(items, formData.orderType), [items, formData.orderType]);
  const deliveryMessage =
    formData.orderType === 'delivery' ? restaurant.ordering.deliveryEstimate : restaurant.ordering.pickupEstimate;

  const handleFieldChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [name]: '',
      cart: '',
    }));
    setSubmitError('');
  };

  const handleAddItem = (item) => {
    addItem({
      id: item.id,
      imageUrl: item.imageUrl,
      name: item.name,
      price: item.price,
      tags: item.tags,
    });

    setFieldErrors((current) => ({
      ...current,
      cart: '',
    }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setFieldErrors({});

    try {
      const result = await submitGuestOrder({
        formData,
        cartItems: items,
        catalogItemsById: itemsById,
      });

      setSuccessData(result);
      clearCart();
    } catch (submitException) {
      if (submitException instanceof OrderValidationError) {
        setFieldErrors(submitException.fieldErrors);
        setSubmitError(submitException.message);
      } else {
        setSubmitError(submitException.message || 'Non siamo riusciti a registrare l ordine.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewOrder = () => {
    setSuccessData(null);
    setSubmitError('');
    setFieldErrors({});
  };

  return (
    <section
      className="section order-experience-section"
      data-header-tone="dark"
      id="ordina"
      aria-labelledby="ordering-title"
    >
      <div className="section-inner">
        <div className="order-layout">
          <Reveal className="order-catalog-column">
            <SectionTitle
              eyebrow={restaurant.ordering.eyebrow}
              id="ordering-title"
              intro={restaurant.ordering.intro}
              title={restaurant.ordering.title}
            />

            <div className="order-note-row">
              <p>{restaurant.ordering.pickupEstimate}</p>
              <p>{restaurant.ordering.deliveryEstimate}</p>
            </div>

            {featuredItems.length ? (
              <div className="order-featured-strip" aria-label="Piatti in evidenza">
                {featuredItems.map((item) => (
                  <article key={item.id} className="order-featured-card">
                    <p>{item.tags[0] || 'Disponibile oggi'}</p>
                    <h3>{item.name}</h3>
                    <span>{formatPrice(item.price)}</span>
                  </article>
                ))}
              </div>
            ) : null}

            {loading ? <MenuCatalogSkeleton variant="order" /> : null}

            {!loading && error ? (
              <StatusPanel
                actionLabel="Riprova"
                message={error}
                onAction={onRetry}
                title="La carta online non e disponibile."
                tone="error"
              />
            ) : null}

            {!loading && !error && categories.length === 0 ? (
              <StatusPanel
                message="Non sono presenti piatti disponibili nella carta online."
                title="Nessuna proposta disponibile."
              />
            ) : null}

            {!loading && !error && categories.length > 0 ? (
              <div className="order-catalog-grid">
                <aside className="order-category-sidebar">
                  <p className="menu-sidebar-label">Categorie</p>
                  <nav className="menu-chip-nav" aria-label="Categorie disponibili per l ordine">
                    {categories.map((category) => (
                      <a key={category.id} className="menu-chip-link" href={`#order-${category.slug}`}>
                        {category.name}
                      </a>
                    ))}
                  </nav>
                </aside>

                <div className="order-category-stack">
                  {categories.map((category) => (
                    <section key={category.id} className="order-category-card" id={`order-${category.slug}`}>
                      <div className="order-category-header">
                        <div>
                          <p className="menu-category-note">{category.items.length} piatti disponibili</p>
                          <h3>{category.name}</h3>
                        </div>
                      </div>

                      <div className="order-item-grid">
                        {category.items.map((item) => {
                          const liveQuantity = getItemQuantity(item.id);

                          return (
                            <article key={item.id} className={`order-item-card ${liveQuantity ? 'is-in-cart' : ''}`}>
                              {item.imageUrl ? (
                                <div className="order-item-media">
                                  <img
                                    alt={item.name}
                                    className="order-item-image"
                                    decoding="async"
                                    loading="lazy"
                                    src={item.imageUrl}
                                  />
                                </div>
                              ) : null}

                              <div className="order-item-copy">
                                <div className="order-item-top">
                                  <div>
                                    <h4>{item.name}</h4>
                                    <p>{item.description}</p>
                                  </div>
                                  <span>{formatPrice(item.price)}</span>
                                </div>

                                <div className="order-item-meta">
                                  {item.tags.length ? (
                                    <div className="menu-tag-list" aria-label="Tag del piatto">
                                      {item.tags.map((tag) => (
                                        <span key={tag} className="menu-tag">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}

                                  {item.allergens.length ? (
                                    <p className="menu-item-allergens">Allergeni: {item.allergens.join(', ')}</p>
                                  ) : null}
                                </div>
                              </div>

                              <div className="order-item-actions">
                                <p>{liveQuantity ? `Nel carrello: ${liveQuantity}` : 'Preparazione al momento'}</p>

                                <Button
                                  className="order-add-button"
                                  onClick={() => handleAddItem(item)}
                                  size="small"
                                  variant="secondary"
                                >
                                  Aggiungi
                                </Button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            ) : null}
          </Reveal>

          <Reveal as="aside" className="order-sidebar" delay={120} direction="left">
            {successData ? (
              <div className="order-success-card">
                <p className="checkout-eyebrow">{restaurant.ordering.successEyebrow}</p>
                <h2>{restaurant.ordering.successTitle}</h2>
                <p className="order-success-message">{restaurant.ordering.successBody}</p>

                <div className="order-success-summary">
                  <div>
                    <span>Ordine</span>
                    <strong>#{successData.orderNumber}</strong>
                  </div>
                  <div>
                    <span>Stato</span>
                    <strong>{successData.status}</strong>
                  </div>
                  <div>
                    <span>Totale</span>
                    <strong>{formatPrice(successData.total)}</strong>
                  </div>
                </div>

                <div className="order-success-details">
                  <p>{successData.customerName}</p>
                  <p>{successData.customerPhone}</p>
                  <p>{successData.orderType === 'delivery' ? 'Consegna' : 'Ritiro'}</p>
                  {successData.address ? <p>{successData.address}</p> : null}
                  {successData.preferredTime ? <p>Orario preferito: {successData.preferredTime}</p> : null}
                </div>

                <div className="order-success-items">
                  {successData.items.map((item) => (
                    <div key={item.id} className="order-success-item">
                      <span>
                        {item.quantity} x {item.name}
                      </span>
                      <span>{formatPrice(item.quantity * item.price)}</span>
                    </div>
                  ))}
                </div>

                <Button className="order-success-action" onClick={handleNewOrder} variant="secondary">
                  Nuovo ordine
                </Button>
              </div>
            ) : (
              <>
                <div className="cart-card">
                  <div className="checkout-heading">
                    <p className="checkout-eyebrow">Carrello</p>
                    <h2>Ordine attuale</h2>
                  </div>

                  {items.length ? (
                    <div className="cart-item-list">
                      {items.map((item) => {
                        const liveItem = itemsById[String(item.id)];

                        return (
                          <article key={item.id} className={`cart-item ${!liveItem ? 'is-unavailable' : ''}`}>
                            <div className="cart-item-copy">
                              <div className="cart-item-top">
                                <h3>{item.name}</h3>
                                <span>{formatPrice(item.price * item.quantity)}</span>
                              </div>
                              {!liveItem ? (
                                <p className="cart-item-warning">Questo piatto non e piu disponibile.</p>
                              ) : null}
                            </div>

                            <div className="cart-item-controls">
                              <QuantityControl
                                compact
                                onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                                onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                                value={item.quantity}
                              />

                              <button className="cart-remove-button" type="button" onClick={() => removeItem(item.id)}>
                                Rimuovi
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="cart-empty-state">
                      <p className="cart-empty-title">{restaurant.ordering.emptyCartTitle}</p>
                      <p>{restaurant.ordering.emptyCartBody}</p>
                    </div>
                  )}

                  <div className="cart-total-stack">
                    <div className="cart-total-row">
                      <span>Subtotale</span>
                      <strong>{formatPrice(totals.subtotal)}</strong>
                    </div>
                    <div className="cart-total-row">
                      <span>Consegna</span>
                      <strong>{totals.deliveryFee ? formatPrice(totals.deliveryFee) : 'Inclusa nel ritiro'}</strong>
                    </div>
                    <div className="cart-total-row is-total">
                      <span>Totale</span>
                      <strong>{formatPrice(totals.total)}</strong>
                    </div>
                  </div>

                  <p className="cart-estimate-note">{deliveryMessage}</p>
                </div>

                <form className="checkout-card" noValidate onSubmit={handleSubmit}>
                  <div className="checkout-heading">
                    <p className="checkout-eyebrow">Checkout</p>
                    <h2>Dati ordine</h2>
                  </div>

                  {submitError ? <p className="form-error-banner">{submitError}</p> : null}

                  <div className="checkout-form-grid">
                    <label className="form-field">
                      <span>Nome e cognome</span>
                      <input
                        name="fullName"
                        onChange={handleFieldChange}
                        placeholder="Es. Giulia Rossi"
                        type="text"
                        value={formData.fullName}
                      />
                      {fieldErrors.fullName ? <small>{fieldErrors.fullName}</small> : null}
                    </label>

                    <label className="form-field">
                      <span>Telefono</span>
                      <input
                        name="phone"
                        onChange={handleFieldChange}
                        placeholder="Es. +39 333 000 0000"
                        type="tel"
                        value={formData.phone}
                      />
                      {fieldErrors.phone ? <small>{fieldErrors.phone}</small> : null}
                    </label>

                    <label className="form-field">
                      <span>Email</span>
                      <input
                        name="email"
                        onChange={handleFieldChange}
                        placeholder="Facoltativa"
                        type="email"
                        value={formData.email}
                      />
                      {fieldErrors.email ? <small>{fieldErrors.email}</small> : null}
                    </label>

                    <div className="form-field">
                      <span>Tipo ordine</span>
                      <div className="choice-grid">
                        <label className={`choice-card ${formData.orderType === 'pickup' ? 'is-selected' : ''}`}>
                          <input
                            checked={formData.orderType === 'pickup'}
                            name="orderType"
                            onChange={handleFieldChange}
                            type="radio"
                            value="pickup"
                          />
                          <span>Ritiro</span>
                        </label>

                        <label className={`choice-card ${formData.orderType === 'delivery' ? 'is-selected' : ''}`}>
                          <input
                            checked={formData.orderType === 'delivery'}
                            name="orderType"
                            onChange={handleFieldChange}
                            type="radio"
                            value="delivery"
                          />
                          <span>Consegna</span>
                        </label>
                      </div>
                      {fieldErrors.orderType ? <small>{fieldErrors.orderType}</small> : null}
                    </div>

                    {formData.orderType === 'delivery' ? (
                      <label className="form-field form-field-full">
                        <span>Indirizzo</span>
                        <textarea
                          name="address"
                          onChange={handleFieldChange}
                          placeholder="Via, numero civico, citofono"
                          rows="3"
                          value={formData.address}
                        />
                        {fieldErrors.address ? <small>{fieldErrors.address}</small> : null}
                      </label>
                    ) : null}

                    <label className="form-field">
                      <span>Orario preferito</span>
                      <input
                        name="preferredTime"
                        onChange={handleFieldChange}
                        placeholder="Es. 20:15"
                        type="text"
                        value={formData.preferredTime}
                      />
                    </label>

                    <label className="form-field form-field-full">
                      <span>Note</span>
                      <textarea
                        name="notes"
                        onChange={handleFieldChange}
                        placeholder="Allergie, dettagli di ritiro o consegna"
                        rows="4"
                        value={formData.notes}
                      />
                    </label>
                  </div>

                  <Button className="checkout-submit" type="submit" variant="primary">
                    {isSubmitting ? 'Invio in corso...' : 'Conferma ordine'}
                  </Button>
                </form>
              </>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default OrderExperienceSection;
