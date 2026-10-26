'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CartItem,
  MenuItem,
  PromoCode,
  OrderType,
  PaymentMethod,
  SpiceLevel,
  CustomizationOption,
  Order,
} from '@/types';
import { calculateOrderTotals, calculateCartItemSubtotal } from '@/lib/pricing';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  finalAmount: number;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  appliedPromo: PromoCode | null;
  applyPromoCode: (code: string) => Promise<{ success: boolean; message: string }>;
  removePromoCode: () => void;
  addToCart: (item: MenuItem, spice?: SpiceLevel, customizations?: CustomizationOption[], notes?: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  recentOrders: string[]; // Order IDs
  addRecentOrder: (orderId: string) => void;
  reorder: (order: Order) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<string[]>([]);

  // Load cart and recent orders from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('mirchi_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedOrders = localStorage.getItem('mirchi_recent_orders');
      if (savedOrders) {
        setRecentOrders(JSON.parse(savedOrders));
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mirchi_cart', JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [items]);

  const addRecentOrder = (orderId: string) => {
    setRecentOrders((prev) => {
      const updated = [orderId, ...prev.filter((id) => id !== orderId)].slice(0, 5);
      try {
        localStorage.setItem('mirchi_recent_orders', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const addToCart = (
    item: MenuItem,
    spice: SpiceLevel = 'Medium',
    customizations: CustomizationOption[] = [],
    notes: string = ''
  ) => {
    setItems((prev) => {
      // Find if an identical item exists (same id, spice level, and customizations)
      const existingIdx = prev.findIndex(
        (ci) =>
          ci.menuItemId === item.id &&
          ci.selectedSpice === spice &&
          JSON.stringify(ci.selectedCustomizations.map((c) => c.id).sort()) ===
            JSON.stringify(customizations.map((c) => c.id).sort())
      );

      if (existingIdx !== -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }

      const newCartItem: CartItem = {
        id: `c_${item.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        selectedSpice: spice,
        selectedCustomizations: customizations,
        notes,
        imageUrl: item.imageUrl,
      };

      return [...prev, newCartItem];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
  };

  const applyPromoCode = async (code: string) => {
    try {
      const subtotal = items.reduce((sum, item) => sum + calculateCartItemSubtotal(item), 0);
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();

      if (data.success && data.promo) {
        setAppliedPromo(data.promo);
        return {
          success: true,
          message: `Coupon ${data.promo.code} applied! You save ₹${data.discountAmount}`,
        };
      } else {
        return {
          success: false,
          message: data.error || 'Invalid promotional coupon',
        };
      }
    } catch {
      return { success: false, message: 'Failed to validate promo code' };
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  const reorder = (order: Order) => {
    // Convert previous order items back into cart items
    const newCartItems: CartItem[] = order.items.map((oi) => ({
      id: `reorder_${oi.productId}_${Date.now()}_${Math.random()}`,
      menuItemId: oi.productId,
      name: oi.productName,
      price: oi.unitPrice,
      quantity: oi.quantity,
      selectedSpice: oi.selectedSpice || 'Medium',
      selectedCustomizations: oi.customizations || [],
      imageUrl: '/images/hero.jpg',
    }));
    setItems(newCartItems);
    setIsCartOpen(true);
  };

  // Calculations
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totals = calculateOrderTotals({
    items,
    orderType,
    appliedPromo,
    distanceKm: 2.5,
  });

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        deliveryFee: totals.deliveryFee,
        taxAmount: totals.taxAmount,
        finalAmount: totals.finalAmount,
        orderType,
        setOrderType,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        recentOrders,
        addRecentOrder,
        reorder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
