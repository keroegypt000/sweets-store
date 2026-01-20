import React, { createContext, useContext, useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';

interface CartContextType {
  cartItemsCount: number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItemsCount, setCartItemsCount] = useState(0);
  
  // Fetch cart items
  const { data: cartItems = [] } = trpc.cart.list.useQuery();
  
  useEffect(() => {
    if (cartItems && Array.isArray(cartItems)) {
      const totalItems = cartItems.reduce((sum, item: any) => sum + (item.quantity || 0), 0);
      setCartItemsCount(totalItems);
    }
  }, [cartItems]);
  
  const refreshCart = () => {
    // This will trigger a refetch of cart items
    trpc.useUtils().cart.list.invalidate();
  };
  
  return (
    <CartContext.Provider value={{ cartItemsCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
