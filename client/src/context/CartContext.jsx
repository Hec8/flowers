import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import { calcCartSubtotal, parsePrice } from '../lib/constants';

const CartContext = createContext(null);
const CART_KEY = 'nflowers_cart';

function normalizeCartItem(product, quantity = 1) {
  return {
    productId: product.id,
    name: product.name,
    price: parsePrice(product.price),
    imageUrl: product.imageUrls?.[0],
    slug: product.slug,
    stock: product.stock ?? 99,
    quantity: Math.max(1, Number(quantity) || 1),
  };
}

function normalizeStoredItems(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => ({
    ...item,
    price: parsePrice(item.price),
    quantity: Math.max(1, Number(item.quantity) || 1),
  }));
}

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      return stored ? normalizeStoredItems(JSON.parse(stored)) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (isAuthenticated && items.length > 0) {
      cartService.sync(items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        quantity: i.quantity,
      }))).catch(() => {});
    }
  }, [isAuthenticated]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const normalized = normalizeCartItem(product, quantity);
      const existing = prev.find((i) =>
        i.productId === normalized.productId || (i.slug && i.slug === normalized.slug),
      );

      const next = existing
        ? prev.map((i) =>
            (i.productId === normalized.productId || (i.slug && i.slug === normalized.slug))
              ? { ...i, ...normalized, quantity: i.quantity + normalized.quantity }
              : i,
          )
        : [...prev, normalized];

      if (isAuthenticated) {
        cartService.add({
          productId: product.id,
          slug: product.slug,
          quantity: normalized.quantity,
        }).catch(() => {});
      }

      return next;
    });
  }, [isAuthenticated]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.productId === productId ? { ...i, quantity: Number(quantity) || 1 } : i)),
      );
    }
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0),
    [items],
  );
  const subtotal = useMemo(() => calcCartSubtotal(items), [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        setItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
