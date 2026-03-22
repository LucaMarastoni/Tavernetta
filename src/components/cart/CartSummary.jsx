import QuantityControl from '../QuantityControl';
import { getCartLineSummary } from '../../utils/cart';
import { formatPrice } from '../../utils/formatPrice';

function CartSummary({
  title,
  eyebrow,
  subtitle,
  items,
  totals,
  emptyTitle,
  emptyBody,
  onDecrease,
  onIncrease,
  onRemove,
  onEdit,
  canEdit,
  footer,
}) {
  return (
    <section className="ordering-cart-card">
      <div className="ordering-card-heading">
        {eyebrow ? <p className="ordering-eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>

      {items.length ? (
        <div className="ordering-cart-lines">
          {items.map((line) => (
            <article key={line.lineId} className="ordering-cart-line">
              <div className="ordering-cart-line-copy">
                <div className="ordering-cart-line-top">
                  <h3>{line.name}</h3>
                  <strong>{formatPrice(line.finalUnitPrice * line.quantity)}</strong>
                </div>

                {getCartLineSummary(line).length ? (
                  <ul className="ordering-cart-line-summary">
                    {getCartLineSummary(line).map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="ordering-cart-line-note">Preparazione standard della casa.</p>
                )}
              </div>

              <div className="ordering-cart-line-actions">
                <QuantityControl
                  compact
                  value={line.quantity}
                  onDecrease={() => onDecrease(line)}
                  onIncrease={() => onIncrease(line)}
                />

                <div className="ordering-cart-line-links">
                  {onEdit && (typeof canEdit === 'function' ? canEdit(line) : true) ? (
                    <button type="button" onClick={() => onEdit(line)}>
                      Modifica
                    </button>
                  ) : null}
                  <button type="button" onClick={() => onRemove(line)}>
                    Rimuovi
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="ordering-empty-state">
          <p className="ordering-empty-title">{emptyTitle}</p>
          <p>{emptyBody}</p>
        </div>
      )}

      <div className="ordering-cart-totals">
        <div>
          <span>Subtotale</span>
          <strong>{formatPrice(totals.subtotal)}</strong>
        </div>
        <div>
          <span>Consegna</span>
          <strong>{totals.deliveryFee ? formatPrice(totals.deliveryFee) : 'Da definire al ritiro'}</strong>
        </div>
        <div className="is-total">
          <span>Totale</span>
          <strong>{formatPrice(totals.total)}</strong>
        </div>
      </div>

      {footer ? <div className="ordering-cart-footer">{footer}</div> : null}
    </section>
  );
}

export default CartSummary;
