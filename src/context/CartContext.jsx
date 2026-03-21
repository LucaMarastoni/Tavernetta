import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'tavernetta-cart-v1';
const CartContext = createContext(null);

function normalizeCartItem(item) {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price),
    quantity: Math.max(1, Number(item.quantity) || 1),
    imageUrl: item.imageUrl || '',
    tags: Array.isArray(item.tags) ? item.tags : [],
  };
}

function readStoredCart() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsed = JSON.parse(rawValue);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeCartItem);
  } catch (error) {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item, quantity = 1) => {
    setItems((currentItems) => {
      const incomingId = String(item.id);
      const existingItem = currentItems.find((currentItem) => String(currentItem.id) === incomingId);

      if (existingItem) {
        return currentItems.map((currentItem) =>
          String(currentItem.id) === incomingId
            ? {
                ...currentItem,
                quantity: currentItem.quantity + quantity,
              }
            : currentItem,
        );
      }

      return [...currentItems, normalizeCartItem({ ...item, quantity })];
    });
  };

  const updateQuantity = (itemId, quantity) => {
    const nextQuantity = Number(quantity);

    setItems((currentItems) => {
      if (nextQuantity <= 0) {
        return currentItems.filter((item) => String(item.id) !== String(itemId));
      }

      return currentItems.map((item) =>
        String(item.id) === String(itemId)
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item,
      );
    });
  };

  const removeItem = (itemId) => {
    setItems((currentItems) => currentItems.filter((item) => String(item.id) !== String(itemId)));
  };

  const clearCart = () => setItems([]);
  const getItemQuantity = (itemId) => items.find((item) => String(item.id) === String(itemId))?.quantity ?? 0;

  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
    }),
    [items],
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
