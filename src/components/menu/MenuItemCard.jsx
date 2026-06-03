import { formatPrice } from '../../utils/formatPrice';

const temporaryMenuImageUrl = `${import.meta.env.BASE_URL}images/editorial/impasto-pizza-ingredienti.jpg`;

function MenuItemCard({ item, onSelect }) {
  const kicker = item.tags?.slice(0, 2).join(' / ');
  const description = item.description || 'Preparazione della casa.';
  const imageUrl = item.imageUrl || temporaryMenuImageUrl;

  return (
    <article className="menu-catalog-item">
      <button className="menu-catalog-item-trigger" type="button" onClick={() => onSelect(item)}>
        <div className={`menu-catalog-item-media ${imageUrl ? '' : 'is-placeholder'}`}>
          {imageUrl ? (
            <img alt={item.name} loading="lazy" decoding="async" src={imageUrl} />
          ) : (
            <div className="menu-catalog-item-placeholder" aria-hidden="true">
              <span>{item.name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="menu-catalog-item-main">
          {kicker ? <p className="menu-catalog-item-kicker">{kicker}</p> : null}

          <div className="menu-catalog-item-copy">
            <h3>{item.name}</h3>
            <p>{description}</p>
          </div>

          <div className="menu-catalog-item-meta">
            <strong>{formatPrice(item.basePrice)}</strong>
          </div>
        </div>
      </button>

      <button
        className="menu-catalog-item-add"
        type="button"
        aria-label={`Apri ${item.name}`}
        onClick={() => onSelect(item)}
      >
        <span aria-hidden="true">+</span>
      </button>
    </article>
  );
}

export default MenuItemCard;
