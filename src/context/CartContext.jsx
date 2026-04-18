import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { normalizeStoredCart } from '../utils/cart';
import { calculateCartTotals } from '../utils/pricing';
import { initialOrderDraft, normalizeOrderDraft } from '../utils/validators';

const CART_STORAGE_KEY = 'tavernetta-cart-v2';
const ORDER_DRAFT_STORAGE_KEY = 'tavernetta-order-draft-v1';

const CartContext = createContext(null);

function readJsonStorage(key, fallbackValue) {
  if (typeof window === 'undefined') {
    return fallbackValue;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallbackValue;
    }

    return JSON.parse(rawValue);
  } catch {
    return fallbackValue;
  }
}

function readStoredCart() {
  return normalizeStoredCart(readJsonStorage(CART_STORAGE_KEY, []));
}

function readStoredDraft() {
  return normalizeOrderDraft(readJsonStorage(ORDER_DRAFT_STORAGE_KEY, initialOrderDraft));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [orderDraft, setOrderDraftState] = useState(readStoredDraft);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(ORDER_DRAFT_STORAGE_KEY, JSON.stringify(orderDraft));
  }, [orderDraft]);

  const addConfiguredItem = (line) => {
    setItems((currentItems) => {
      const existingLine = currentItems.find((item) => item.lineId === line.lineId);

      if (!existingLine) {
        return [...currentItems, line];
      }

      return currentItems.map((item) =>
        item.lineId === line.lineId
          ? {
              ...item,
              quantity: item.quantity + line.quantity,
            }
          : item,
      );
    });
  };

  const replaceConfiguredItem = (previousLineId, nextLine) => {
    setItems((currentItems) => {
      const itemsWithoutPrevious = currentItems.filter((item) => item.lineId !== previousLineId);
      const existingMatchingLine = itemsWithoutPrevious.find((item) => item.lineId === nextLine.lineId);

      if (!existingMatchingLine) {
        return [...itemsWithoutPrevious, nextLine];
      }

      return itemsWithoutPrevious.map((item) =>
        item.lineId === nextLine.lineId
          ? {
              ...item,
              quantity: item.quantity + nextLine.quantity,
            }
          : item,
      );
    });
  };

  const updateQuantity = (lineId, quantity) => {
    const nextQuantity = Number(quantity);

    setItems((currentItems) => {
      if (nextQuantity <= 0) {
        return currentItems.filter((item) => item.lineId !== lineId);
      }

      return currentItems.map((item) =>
        item.lineId === lineId
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item,
      );
    });
  };

  const removeItem = (lineId) => {
    setItems((currentItems) => currentItems.filter((item) => item.lineId !== lineId));
  };

  const clearCart = () => setItems([]);

  const updateOrderDraft = (patch) => {
    setOrderDraftState((currentDraft) => normalizeOrderDraft({ ...currentDraft, ...patch }));
  };

  const resetOrderDraft = () => setOrderDraftState(initialOrderDraft);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totals: calculateCartTotals(items, orderDraft.orderType),
      orderDraft,
      addConfiguredItem,
      replaceConfiguredItem,
      updateQuantity,
      removeItem,
      clearCart,
      updateOrderDraft,
      resetOrderDraft,
    }),
    [items, orderDraft],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart deve essere usato all interno di CartProvider.');
  }

  return context;
}
