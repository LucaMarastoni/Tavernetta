import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/formatPrice';

function CartStickyBar({ itemCount, total }) {
  if (!itemCount) {
    return null;
  }

  return (
    <div className="ordering-sticky-cart">
      <div className="ordering-sticky-cart-copy">
        <span>{itemCount} {itemCount === 1 ? 'articolo' : 'articoli'}</span>
        <strong>{formatPrice(total)}</strong>
      </div>

      <Link className="ordering-sticky-cart-link" to="/ordina" viewTransition>
        Continua
      </Link>
    </div>
  );
}

export default CartStickyBar;
