import { useEffect, useMemo, useState } from 'react';
import {
  formatPreferredTimeClock,
  formatPreferredTimeDateTime,
  isCurrentDayPreferredTime,
  parsePreferredTimeValue,
} from '../../../shared/orderTiming.js';
import { formatPrice } from '../../utils/formatPrice';

const ORDER_GROUPS = [
  {
    id: 'todo',
    title: 'Da fare',
    intro: 'Ordini attivi da gestire adesso, con una lettura piu immediata delle priorita.',
  },
  {
    id: 'closed',
    title: 'Chiusi',
    intro: 'Storico degli ordini gia conclusi, consultabile in una vista separata e piu discreta.',
  },
];

const ORDER_STATUS_LABELS = {
  pending: 'Nuovo',
  confirmed: 'Confermato',
  preparing: 'In forno',
  ready: 'Pronto',
  delivered: 'Consegnato',
  completed: 'Completato',
  cancelled: 'Annullato',
};

const ORDER_STATUS_ACTIONS = {
  pending: [
    { status: 'confirmed', label: 'Conferma' },
    { status: 'preparing', label: 'Inizia' },
  ],
  confirmed: [
    { status: 'preparing', label: 'Inizia' },
    { status: 'ready', label: 'Pronto' },
  ],
  preparing: [{ status: 'ready', label: 'Pronto' }],
  ready: [{ status: 'completed', label: 'Chiudi' }],
};

function isClosedOrderStatus(status) {
  return status === 'delivered' || status === 'completed' || status === 'cancelled';
}

function getOrderGroup(status) {
  return isClosedOrderStatus(status) ? 'closed' : 'todo';
}

function formatOrderType(orderType) {
  return orderType === 'delivery' ? 'Consegna' : 'Ritiro';
}

function formatOrderStatus(status) {
  return ORDER_STATUS_LABELS[status] ?? 'Da gestire';
}

function getOrderStatusActions(status) {
  return ORDER_STATUS_ACTIONS[status] ?? [];
}

function resolveOrderDate(order) {
  return parsePreferredTimeValue(order.preferredTime, order.createdAt);
}

function getOrderSortValue(order) {
  const resolvedDate = resolveOrderDate(order);
  return resolvedDate ? resolvedDate.getTime() : Number.POSITIVE_INFINITY;
}

function formatOrderClock(order) {
  return formatPreferredTimeClock(order.preferredTime, order.createdAt);
}

function isCurrentDayOrder(order, today = new Date()) {
  return isCurrentDayPreferredTime(order.preferredTime, today, order.createdAt);
}

function formatOrderTime(order) {
  return formatPreferredTimeDateTime(order.preferredTime, order.createdAt);
}

function formatFieldValue(value, fallbackValue = 'Non disponibile') {
  const normalizedValue = String(value || '').trim();
  return normalizedValue || fallbackValue;
}

function getOrderItems(order) {
  return Array.isArray(order.items) ? order.items : [];
}

function getItemCountLabel(items) {
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  return `${totalQuantity} ${totalQuantity === 1 ? 'articolo' : 'articoli'}`;
}

function getOrderPreview(items, limit = 2) {
  if (!items.length) {
    return 'Nessun prodotto registrato.';
  }

  const previewItems = items.slice(0, limit).map((item) => `${item.name} x${item.quantity}`);
  const remainingItems = items.length - previewItems.length;

  return remainingItems > 0 ? `${previewItems.join(', ')} + altri ${remainingItems}` : previewItems.join(', ');
}

function uniqueNotes(values) {
  return [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))];
}

function getOrderItemSummary(item) {
  const summary = [];
  const selectedOptions = Array.isArray(item.customization?.selectedOptions) ? item.customization.selectedOptions : [];
  const removedIngredients = Array.isArray(item.customization?.removedIngredients)
    ? item.customization.removedIngredients
    : [];
  const addedExtras = Array.isArray(item.customization?.addedExtras) ? item.customization.addedExtras : [];

  if (selectedOptions.length) {
    const groupedOptions = selectedOptions.reduce((groups, option) => {
      const groupName = option.groupName || 'Opzione';
      const currentOptions = groups.get(groupName) ?? [];
      groups.set(groupName, [...currentOptions, option.optionName]);
      return groups;
    }, new Map());

    groupedOptions.forEach((optionNames, groupName) => {
      summary.push(`${groupName}: ${optionNames.join(', ')}`);
    });
  }

  if (removedIngredients.length) {
    summary.push(`Senza ${removedIngredients.map((ingredient) => ingredient.name).join(', ')}`);
  }

  if (addedExtras.length) {
    summary.push(`Extra ${addedExtras.map((extra) => extra.name).join(', ')}`);
  }

  uniqueNotes([item.notes, item.customization?.specialNotes]).forEach((note) => {
    summary.push(`Nota: ${note}`);
  });

  return summary;
}

function OrderStatusActions({ order, isUpdating = false, onUpdateOrderStatus }) {
  const actions = getOrderStatusActions(order.status);

  if (!actions.length || !onUpdateOrderStatus) {
    return null;
  }

  return (
    <div className="admin-order-action-row" aria-label={`Azioni ordine ${order.customerName}`}>
      {actions.map((action) => (
        <button
          key={`${order.id}-${action.status}`}
          className="admin-order-action-button"
          type="button"
          onClick={() => onUpdateOrderStatus(order, action.status)}
          disabled={isUpdating}
        >
          {isUpdating ? 'Aggiorno...' : action.label}
        </button>
      ))}
    </div>
  );
}

function OrderDetailsModal({ order, onClose, isUpdating = false, onUpdateOrderStatus }) {
  useEffect(() => {
    if (!order) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [order, onClose]);

  if (!order) {
    return null;
  }

  const items = getOrderItems(order);
  const orderNotes = uniqueNotes([order.notes]);
  const primaryDetails = [
    { label: 'Telefono', value: formatFieldValue(order.customerPhone) },
    { label: 'Email', value: formatFieldValue(order.customerEmail) },
    { label: 'Tipo ordine', value: formatOrderType(order.orderType) },
    { label: 'Orario', value: formatOrderTime(order) },
  ];

  if (order.orderType === 'delivery') {
    primaryDetails.push({
      label: 'Indirizzo',
      value: formatFieldValue(order.address),
    });
  }

  return (
    <div className="admin-modal-root" role="dialog" aria-modal="true" aria-labelledby="admin-order-details-title">
      <button className="admin-modal-backdrop" type="button" aria-label="Chiudi dettaglio ordine" onClick={onClose} />

      <div className="admin-modal-panel admin-order-modal">
        <div className="admin-modal-content">
          <div className="admin-modal-head admin-order-modal-head">
            <div className="admin-order-modal-copy">
              <p className="admin-kicker">Riepilogo ordine</p>
              <div className="admin-order-modal-title-row">
                <h2 id="admin-order-details-title">{order.customerName}</h2>
                <strong className="admin-order-modal-time">{formatOrderClock(order)}</strong>
              </div>
              <div className="admin-order-modal-badges">
                <span className="admin-inline-badge">{formatOrderType(order.orderType)}</span>
                <span className="admin-inline-badge">{getItemCountLabel(items)}</span>
                <span className="admin-inline-badge is-todo">{formatOrderStatus(order.status)}</span>
              </div>
            </div>

            <div className="admin-order-modal-side">
              <strong className="admin-order-modal-total">{formatPrice(order.total)}</strong>
              <button className="admin-ghost-button" type="button" onClick={onClose}>
                Chiudi
              </button>
            </div>
          </div>

          <OrderStatusActions
            order={order}
            isUpdating={isUpdating}
            onUpdateOrderStatus={onUpdateOrderStatus}
          />

          <div className="admin-order-detail-grid">
            <section className="admin-order-detail-card">
              <h3>Dettagli cliente</h3>
              <dl className="admin-order-detail-list">
                {primaryDetails.map((detail) => (
                  <div key={detail.label}>
                    <dt>{detail.label}</dt>
                    <dd>{detail.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="admin-order-detail-card">
              <h3>Totali</h3>
              <dl className="admin-order-detail-list">
                <div>
                  <dt>Subtotale</dt>
                  <dd>{formatPrice(order.subtotal)}</dd>
                </div>
                <div>
                  <dt>Consegna</dt>
                  <dd>{order.deliveryFee ? formatPrice(order.deliveryFee) : 'Inclusa nel ritiro'}</dd>
                </div>
                <div>
                  <dt>Totale</dt>
                  <dd>{formatPrice(order.total)}</dd>
                </div>
              </dl>
            </section>
          </div>

          {orderNotes.length ? (
            <section className="admin-order-detail-card">
              <h3>Note ordine</h3>
              <div className="admin-order-note-stack">
                {orderNotes.map((note, noteIndex) => (
                  <p key={`order-note-${noteIndex}`}>{note}</p>
                ))}
              </div>
            </section>
          ) : null}

          <section className="admin-order-detail-card">
            <div className="admin-order-detail-head">
              <h3>Prodotti</h3>
              <span>{getItemCountLabel(items)}</span>
            </div>

            <ul className="admin-order-lines" role="list">
              {items.map((item) => {
                const itemSummary = getOrderItemSummary(item);

                return (
                  <li key={item.id || `${item.name}-${item.quantity}`} className="admin-order-line">
                    <div className="admin-order-line-head">
                      <span className="admin-order-line-title">{`${item.name} x${item.quantity}`}</span>
                      <strong>{formatPrice(item.lineTotal)}</strong>
                    </div>

                    {itemSummary.length ? (
                      <ul className="admin-order-line-summary" role="list">
                        {itemSummary.map((entry, entryIndex) => (
                          <li key={`${item.id || item.name}-${entryIndex}`}>{entry}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="admin-order-line-note">Preparazione standard.</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel({ orders, loading, error, onRefresh, onUpdateOrderStatus }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    const nextSelectedOrder = orders.find((order) => order.id === selectedOrder.id) ?? null;

    if (!nextSelectedOrder) {
      setSelectedOrder(null);
      return;
    }

    if (nextSelectedOrder !== selectedOrder) {
      setSelectedOrder(nextSelectedOrder);
    }
  }, [orders, selectedOrder]);

  const ordersByGroup = useMemo(() => {
    const today = new Date();
    const todayOrders = orders.filter((order) => isCurrentDayOrder(order, today));
    const sortedOrders = [...todayOrders].sort((left, right) => {
      const byTime = getOrderSortValue(left) - getOrderSortValue(right);

      if (byTime !== 0) {
        return byTime;
      }

      return String(left.customerName || '').localeCompare(
        String(right.customerName || ''),
        'it',
      );
    });

    return {
      todo: sortedOrders.filter((order) => getOrderGroup(order.status) === 'todo'),
      closed: sortedOrders.filter((order) => getOrderGroup(order.status) === 'closed'),
    };
  }, [orders]);

  const orderStats = useMemo(
    () => ({
      todoCount: ordersByGroup.todo.length,
      closedCount: ordersByGroup.closed.length,
    }),
    [ordersByGroup],
  );

  const handleUpdateOrderStatus = async (order, status) => {
    if (!onUpdateOrderStatus || updatingOrderId) {
      return;
    }

    setUpdatingOrderId(String(order.id));
    setStatusError('');

    try {
      await onUpdateOrderStatus(order.id, status);
    } catch (error) {
      setStatusError(error.message || 'Non siamo riusciti ad aggiornare lo stato dell ordine.');
    } finally {
      setUpdatingOrderId('');
    }
  };

  return (
    <>
      <section className="admin-section admin-surface admin-orders-kitchen" aria-labelledby="admin-orders-title">
        <div className="admin-section-head">
          <div>
            <p className="admin-kicker">Ordini</p>
            <h2 id="admin-orders-title">Ordini</h2>
            <p className="admin-section-intro">
              La lista mette in primo piano cliente, orario, servizio e totale, mentre il riepilogo completo si apre
              in una scheda dedicata. Vengono mostrati solo gli ordini della giornata corrente.
            </p>
          </div>

          <div className="admin-orders-summary">
            <span className="admin-status-pill is-todo">{`Da fare ${orderStats.todoCount}`}</span>
            <span className="admin-status-pill is-closed">{`Chiusi ${orderStats.closedCount}`}</span>
            <button className="admin-secondary-button" type="button" onClick={() => onRefresh()} disabled={loading}>
              {loading ? 'Aggiorno...' : 'Aggiorna'}
            </button>
          </div>
        </div>

        {error ? (
          <div className="admin-empty-state">
            <h3>Ordini non disponibili</h3>
            <p>{error}</p>
          </div>
        ) : null}

        {statusError ? (
          <div className="admin-order-status-error" role="alert">
            {statusError}
          </div>
        ) : null}

        <div className="admin-orders-groups">
          {ORDER_GROUPS.map((group) => {
            const groupOrders = ordersByGroup[group.id];
            const isPrimaryGroup = group.id === 'todo';

            return (
              <section
                key={group.id}
                className={`admin-orders-group ${isPrimaryGroup ? 'is-primary' : 'is-secondary'}`}
                aria-labelledby={`admin-orders-group-${group.id}`}
              >
                <div className="admin-orders-group-head">
                  <div className="admin-orders-group-copy">
                    <p className="admin-kicker">{isPrimaryGroup ? 'Operativo' : 'Archivio'}</p>
                    <h3 id={`admin-orders-group-${group.id}`}>{group.title}</h3>
                    <p>{group.intro}</p>
                  </div>
                </div>

                <div className="admin-orders-list">
                  {loading && !orders.length ? (
                    <div className="admin-empty-state">
                      <h3>Caricamento ordini</h3>
                      <p>Sto leggendo gli ordini registrati dal sistema.</p>
                    </div>
                  ) : groupOrders.length ? (
                    groupOrders.map((order) => {
                      const orderItems = getOrderItems(order);
                      const hasDeliveryAddress = order.orderType === 'delivery' && String(order.address || '').trim();
                      const hasOrderNotes = String(order.notes || '').trim();

                      return (
                        <article
                          key={order.id}
                          className={`admin-order-card ${isPrimaryGroup ? 'is-todo' : 'is-closed'} order-layout-card`}
                        >
                          <div className="admin-order-card-head">
                            <div className="admin-order-card-copy">
                              <div className="admin-order-card-title-row">
                                <h3>{order.customerName}</h3>
                                <strong className="admin-order-card-time">{formatOrderClock(order)}</strong>
                              </div>
                              <div className="admin-order-hero-meta">
                                <span className="admin-inline-badge">{formatOrderType(order.orderType)}</span>
                                <span className="admin-inline-badge">{getItemCountLabel(orderItems)}</span>
                                <span className="admin-inline-badge is-todo">{formatOrderStatus(order.status)}</span>
                              </div>
                            </div>

                            <div className="admin-order-hero-total">
                              <span>Totale</span>
                              <strong>{formatPrice(order.total)}</strong>
                            </div>
                          </div>

                          <div className="admin-order-glance-grid">
                            <div className="admin-order-glance-card">
                              <p className="admin-order-glance-label">Riepilogo rapido</p>
                              <p className="admin-order-glance-value">{getOrderPreview(orderItems)}</p>
                            </div>

                            <div className="admin-order-glance-card">
                              <p className="admin-order-glance-label">Contatto</p>
                              <p className="admin-order-glance-value">{formatFieldValue(order.customerPhone)}</p>
                            </div>

                            {hasDeliveryAddress ? (
                              <div className="admin-order-glance-card">
                                <p className="admin-order-glance-label">Indirizzo</p>
                                <p className="admin-order-glance-value">{order.address}</p>
                              </div>
                            ) : null}

                            {hasOrderNotes ? (
                              <div className="admin-order-glance-card">
                                <p className="admin-order-glance-label">Note ordine</p>
                                <p className="admin-order-glance-value">{order.notes}</p>
                              </div>
                            ) : null}
                          </div>

                          <div className="admin-row-actions">
                            <OrderStatusActions
                              order={order}
                              isUpdating={updatingOrderId === String(order.id)}
                              onUpdateOrderStatus={handleUpdateOrderStatus}
                            />
                            <button className="admin-primary-button" type="button" onClick={() => setSelectedOrder(order)}>
                              Apri ordine
                            </button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="admin-empty-state">
                      <h3>{isPrimaryGroup ? 'Nessun ordine di oggi da fare' : 'Nessun ordine di oggi chiuso'}</h3>
                      <p>
                        {isPrimaryGroup
                          ? 'Quando arrivano ordini nella giornata corrente, li trovi subito qui ordinati per orario.'
                          : 'Gli ordini chiusi della giornata corrente restano qui come storico rapido.'}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        isUpdating={selectedOrder ? updatingOrderId === String(selectedOrder.id) : false}
        onUpdateOrderStatus={handleUpdateOrderStatus}
      />
    </>
  );
}

export default OrdersPanel;
