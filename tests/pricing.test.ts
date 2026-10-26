import { describe, it, expect } from 'vitest';
import { calculateCartItemSubtotal, calculateOrderTotals } from '../src/lib/pricing';
import { calculateDeliveryFee } from '../src/lib/delivery';
import { CartItem, PromoCode } from '../src/types';

describe('Pricing and Cart Calculation Engine', () => {
  const sampleItem1: CartItem = {
    id: 'c1',
    menuItemId: 'p1',
    name: 'Masala Puri',
    price: 60,
    quantity: 2,
    selectedSpice: 'Medium',
    selectedCustomizations: [{ id: 'a1', name: 'Extra Sev', price: 10 }],
    imageUrl: '/images/hero.jpg',
  };

  const sampleItem2: CartItem = {
    id: 'c2',
    menuItemId: 'p2',
    name: 'Dahi Puri',
    price: 80,
    quantity: 1,
    selectedSpice: 'Mild',
    selectedCustomizations: [],
    imageUrl: '/images/dahi_chaat.jpg',
  };

  it('calculates single cart item subtotal with customization add-ons correctly', () => {
    // (60 + 10) * 2 = 140
    const subtotal = calculateCartItemSubtotal(sampleItem1);
    expect(subtotal).toBe(140);
  });

  it('calculates order total for Delivery under free delivery threshold', () => {
    // Items total: 140 + 80 = 220
    // Delivery fee (distance 2.5km): 30
    // Subtotal: 220, Discount: 0
    // Tax (5% on 220): 11
    // Total: 220 + 30 + 11 = 261
    const result = calculateOrderTotals({
      items: [sampleItem1, sampleItem2],
      orderType: 'DELIVERY',
      distanceKm: 2.5,
      baseDeliveryFee: 30,
      freeDeliveryThreshold: 399,
      gstRate: 0.05,
    });

    expect(result.subtotal).toBe(220);
    expect(result.deliveryFee).toBe(30);
    expect(result.taxAmount).toBe(11);
    expect(result.finalAmount).toBe(261);
  });

  it('applies percentage promo code with cap correctly', () => {
    const promo: PromoCode = {
      id: 'promo-1',
      code: 'CHAAT20',
      description: '20% off up to ₹50',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderValue: 150,
      maxDiscount: 40,
      isActive: true,
    };

    // Subtotal 220 > min 150. 20% of 220 is 44, capped at maxDiscount 40.
    const result = calculateOrderTotals({
      items: [sampleItem1, sampleItem2],
      orderType: 'DELIVERY',
      appliedPromo: promo,
      distanceKm: 2.5,
    });

    expect(result.discountAmount).toBe(40);
    // Discounted subtotal: 180. Tax 5% on 180 = 9. Delivery 30. Total = 180 + 30 + 9 = 219.
    expect(result.taxAmount).toBe(9);
    expect(result.finalAmount).toBe(219);
  });

  it('provides ₹0 delivery fee for Takeaway and for orders above free threshold', () => {
    const takeawayResult = calculateOrderTotals({
      items: [sampleItem1, sampleItem2],
      orderType: 'TAKEAWAY',
    });
    expect(takeawayResult.deliveryFee).toBe(0);

    const largeOrder: CartItem = {
      ...sampleItem1,
      quantity: 6, // (60+10)*6 = 420 (above 399 threshold)
    };
    const freeDeliveryResult = calculateOrderTotals({
      items: [largeOrder],
      orderType: 'DELIVERY',
      freeDeliveryThreshold: 399,
    });
    expect(freeDeliveryResult.deliveryFee).toBe(0);
  });
});

describe('Modular Delivery Service Layer', () => {
  it('identifies addresses outside maximum delivery radius', () => {
    const check = calculateDeliveryFee(200, 12, 30, 8, 399);
    expect(check.isDeliverable).toBe(false);
    expect(check.reason).toContain('exceeds our maximum');
  });

  it('calculates tiered delivery fee based on distance', () => {
    // 5 km: base 30 for first 3km + (5 - 3) * 10 = 50
    const check = calculateDeliveryFee(200, 5, 30, 8, 399);
    expect(check.isDeliverable).toBe(true);
    expect(check.deliveryFee).toBe(50);
  });
});
