import { useMemo } from 'react';
import { formatPrice } from '../../utils/formatPrice';

const ORDER_GROUPS = [
  {
    id: 'todo',
    title: 'Da fare',
    intro: 'Ordini attivi da gestire adesso, con azioni rapide sempre disponibili.',
  },
  {
    id: 'closed',
    title: 'Chiusi',
    intro: 'Storico consultabile degli ordini non piu attivi, completati o annullati.',
  },
];

const STATUS_LABELS = {
  pending: 'Nuovo',
  confirmed: 'Confermato',
  new: 'Nuovo',
  preparing: 'In preparazione',
  ready: 'Pronto',
  delivered: 'Consegnato',
  completed: 'Completato',
  cancelled: 'Annullato',
};

function isClosedOrderStatus(status) {
  return status === 'delivered' || status === 'completed' || status === 'cancelled';
}

function getOrderGroup(status) {
  return isClosedOrderStatus(status) ? 'closed' : 'todo';
}

function getStatusPriority(status) {
  switch (status) {
    case 'pending':
      return 0;
    case 'confirmed':
      return 1;
    case 'new':
      return 2;
    case 'preparing':
      return 3;
    case 'ready':
      return 4;
    case 'delivered':
      return 5;
    case 'completed':
      return 6;
    case 'cancelled':
      return 7;
    default:
      return 8;
  }
}

function getOrderActions(status) {
  switch (status) {
    case 'pending':
    case 'confirmed':
    case 'new':
      return [
        { label: 'In preparazione', nextStatus: 'preparing', tone: 'primary' },
        { label: 'Chiudi', nextStatus: 'completed', tone: 'secondary' },
        { label: 'Annulla', nextStatus: 'cancelled', tone: 'danger' },
      ];
    case 'preparing':
      return [
        { label: 'Pronto', nextStatus: 'ready', tone: 'primary' },
        { label: 'Chiudi', nextStatus: 'completed', tone: 'secondary' },
        { label: 'Annulla', nextStatus: 'cancelled', tone: 'danger' },
      ];
    case 'ready':
      return [
        { label: 'Consegnato', nextStatus: 'delivered', tone: 'primary' },
        { label: 'Chiudi', nextStatus: 'completed', tone: 'secondary' },
        { label: 'Annulla', nextStatus: 'cancelled', tone: 'danger' },
      ];
    default:
      return [];
  }
}

function formatOrderLabel(order) {
  return order.orderNumber ? `#${order.orderNumber}` : order.id;
}

function formatOrderType(orderType) {
  return orderType === 'delivery' ? 'Consegna' : 'Ritiro';
}

function formatOrderTime(order) {
  const referenceDate = order.preferredTime || order.createdAt;

  if (!referenceDate) {
    return 'Orario non disponibile';
  }

  const parsedDate = new Date(referenceDate);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(referenceDate);
  }

  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsedDate);
}

function OrdersPanel({ orders, loading, error, updatingOrderId, onRefresh, onUpdateStatus }) {
  const ordersByGroup = useMemo(() => {
    const sortedOrders = [...orders].sort((left, right) => {
      const byStatus = getStatusPriority(left.status) - getStatusPriority(right.status);

      if (byStatus !== 0) {
        return byStatus;
      }

      return String(right.preferredTime || right.createdAt || '').localeCompare(String(left.preferredTime || left.createdAt || ''), 'it');
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

  return (
    <section className="admin-section admin-surface" aria-labelledby="admin-orders-title">
      <div className="admin-section-head">
        <div>
          <p className="admin-kicker">Ordini</p>
          <h2 id="admin-orders-title">Ordini</h2>
          <p className="admin-section-intro">
            La vista da gestionale mette in evidenza cio che va gestito adesso e separa in modo discreto lo storico
            degli ordini gia chiusi.
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
                    const isClosedOrder = getOrderGroup(order.status) === 'closed';
                    const actions = getOrderActions(order.status);

                    return (
                      <article
                        key={order.id}
                        className={`admin-order-card ${isClosedOrder ? 'is-closed' : 'is-todo'} is-${order.status}`}
                      >
                        <div className="admin-order-card-head">
                          <div>
                            <p className="admin-order-id">{formatOrderLabel(order)}</p>
                            <h3>{order.customerName}</h3>
                          </div>

                          <div className="admin-order-summary">
                            <div className="admin-order-badges">
                              <span className={`admin-order-status is-${order.status}`}>
                                {STATUS_LABELS[order.status] ?? 'Da gestire'}
                              </span>
                            </div>
                            <strong>{formatPrice(order.total)}</strong>
                          </div>
                        </div>

                        <div className="admin-order-meta">
                          <span>{formatOrderType(order.orderType)}</span>
                          <span>{formatOrderTime(order)}</span>
                        </div>

                        <ul className="admin-order-lines" role="list">
                          {order.items.map((item) => (
                            <li key={item.id || `${item.name}-${item.quantity}`}>
                              {item.name} x{item.quantity}
                            </li>
                          ))}
                        </ul>

                        {!isClosedOrder && actions.length ? (
                          <div className="admin-row-actions">
                            {actions.map((action) => (
                              <button
                                key={action.label}
                                className={
                                  action.tone === 'danger'
                                    ? 'admin-danger-button'
                                    : action.tone === 'secondary'
                                      ? 'admin-secondary-button'
                                      : 'admin-primary-button'
                                }
                                type="button"
                                disabled={updatingOrderId === order.id}
                                onClick={() => onUpdateStatus(order.id, action.nextStatus)}
                              >
                                {updatingOrderId === order.id ? 'Aggiorno...' : action.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                ) : (
                  <div className="admin-empty-state">
                    <h3>{isPrimaryGroup ? 'Nessun ordine da fare' : 'Nessun ordine chiuso'}</h3>
                    <p>
                      {isPrimaryGroup
                        ? 'Quando arrivano nuovi ordini o ci sono ordini ancora attivi, li trovi subito qui.'
                        : 'Gli ordini completati o annullati restano qui come storico consultabile.'}
                    </p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}

export default OrdersPanel;
