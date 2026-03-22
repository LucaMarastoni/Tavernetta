import { formatPrice } from '../../utils/formatPrice';

function MenuItemCard({ item, onConfigure, onQuickAdd }) {
  const actionLabel = item.hasCustomization ? 'Personalizza' : 'Aggiungi';
  const eyebrow = item.tags?.[0] || 'Forno Tavernetta';

  return (
    <article className="ordering-menu-item">
      <div className={`ordering-menu-item-media ${item.imageUrl ? '' : 'is-placeholder'}`}>
        {item.imageUrl ? (
          <img alt={item.name} loading="lazy" decoding="async" src={item.imageUrl} />
        ) : (
          <div className="ordering-menu-item-placeholder" aria-hidden="true">
            <span>{item.name.charAt(0)}</span>
            <small>Pizza artigianale</small>
          </div>
        )}

        <div className="ordering-menu-item-media-top">
          <span className="ordering-menu-item-kicker">{eyebrow}</span>
          <strong className="ordering-menu-item-price">{formatPrice(item.basePrice)}</strong>
        </div>

        <div className="ordering-menu-item-media-bottom">
          <span className="ordering-menu-item-status">
            {item.hasCustomization ? 'Personalizzabile' : 'Ricetta della casa'}
          </span>
        </div>
      </div>

      <div className="ordering-menu-item-body">
        <div className="ordering-menu-item-copy">
          <div className="ordering-menu-item-header">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
          </div>

          {item.tags?.length ? (
            <div className="ordering-menu-tag-list" aria-label="Tag del prodotto">
              {item.tags.map((tag) => (
                <span key={tag} className="ordering-menu-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="ordering-menu-item-footer">
          <button
            className="ordering-inline-cta"
            type="button"
            onClick={() => (item.hasCustomization ? onConfigure(item) : onQuickAdd(item))}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </article>
  );
}

export default MenuItemCard;
