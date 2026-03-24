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
  new: 'Nuovo',
  preparing: 'In preparazione',
  completed: 'Completato',
  cancelled: 'Annullato',
};

const TODO_ORDER_ACTIONS = [
  { label: 'Segna come chiuso', nextStatus: 'completed', tone: 'primary' },
  { label: 'Annulla', nextStatus: 'cancelled', tone: 'danger' },
];

function isClosedOrderStatus(status) {
  return status === 'completed' || status === 'cancelled';
}

function getOrderGroup(status) {
  return isClosedOrderStatus(status) ? 'closed' : 'todo';
}

function getStatusPriority(status) {
  switch (status) {
    case 'new':
      return 0;
    case 'preparing':
      return 1;
    case 'completed':
      return 2;
    case 'cancelled':
      return 3;
    default:
      return 4;
  }
}

function OrdersPanel({ orders, onUpdateStatus }) {
  const ordersByGroup = useMemo(() => {
    const sortedOrders = [...orders].sort((left, right) => {
      const byStatus = getStatusPriority(left.status) - getStatusPriority(right.status);

      if (byStatus !== 0) {
        return byStatus;
      }

      return right.scheduledAt.localeCompare(left.scheduledAt, 'it');
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
        </div>
      </div>

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
                {groupOrders.length ? (
                  groupOrders.map((order) => {
                    const isClosedOrder = getOrderGroup(order.status) === 'closed';

                    return (
                      <article
                        key={order.id}
                        className={`admin-order-card ${isClosedOrder ? 'is-closed' : 'is-todo'} is-${order.status}`}
                      >
                        <div className="admin-order-card-head">
                          <div>
                            <p className="admin-order-id">{order.id}</p>
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
                          <span>{order.type}</span>
                          <span>{order.scheduledAt}</span>
                        </div>

                        <ul className="admin-order-lines" role="list">
                          {order.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>

                        {!isClosedOrder ? (
                          <div className="admin-row-actions">
                            {TODO_ORDER_ACTIONS.map((action) => (
                              <button
                                key={action.label}
                                className={action.tone === 'danger' ? 'admin-danger-button' : 'admin-primary-button'}
                                type="button"
                                onClick={() => onUpdateStatus(order.id, action.nextStatus)}
                              >
                                {action.label}
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
