import { CartItem, PromoCode, OrderType } from '@/types';

export interface OrderCalculationResult {
  subtotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxAmount: number;
  finalAmount: number;
  estimatedFoodCost: number;
  packagingCost: number;
  estimatedContribution: number;
}

export function calculateCartItemSubtotal(item: CartItem): number {
  const addonsTotal = (item.selectedCustomizations || []).reduce(
    (sum, add) => sum + (add.price || 0),
    0
  );
  return (item.price + addonsTotal) * item.quantity;
}

export function calculateOrderTotals({
  items,
  orderType,
  appliedPromo,
  distanceKm = 2.5,
  baseDeliveryFee = 30,
  freeDeliveryThreshold = 399,
  gstRate = 0.05,
  variableCostRatio = 0.40,
}: {
  items: CartItem[];
  orderType: OrderType;
  appliedPromo?: PromoCode | null;
  distanceKm?: number;
  baseDeliveryFee?: number;
  freeDeliveryThreshold?: number;
  gstRate?: number;
  variableCostRatio?: number;
}): OrderCalculationResult {
  const subtotal = items.reduce((sum, item) => sum + calculateCartItemSubtotal(item), 0);

  let discountAmount = 0;
  if (appliedPromo && appliedPromo.isActive) {
    if (subtotal >= appliedPromo.minOrderValue) {
      if (appliedPromo.discountType === 'PERCENTAGE') {
        const calculatedDiscount = (subtotal * appliedPromo.discountValue) / 100;
        discountAmount = appliedPromo.maxDiscount
          ? Math.min(calculatedDiscount, appliedPromo.maxDiscount)
          : calculatedDiscount;
      } else {
        discountAmount = appliedPromo.discountValue;
      }
    }
  }

  // Ensure discount doesn't exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  // Delivery fee
  let deliveryFee = 0;
  if (orderType === 'DELIVERY') {
    if (subtotal >= freeDeliveryThreshold) {
      deliveryFee = 0;
    } else {
      deliveryFee = baseDeliveryFee;
      if (distanceKm > 3) {
        deliveryFee += Math.round((distanceKm - 3) * 10);
      }
    }
  } else {
    // Takeaway has ₹0 delivery fee
    deliveryFee = 0;
  }

  // GST 5% on discounted food subtotal
  const taxAmount = Math.round(discountedSubtotal * gstRate * 100) / 100;

  // Final payable total
  const finalAmount = Math.round(discountedSubtotal + deliveryFee + taxAmount);

  // Business contribution / margin estimation
  const packagingCost = items.length > 0 ? 15 : 0; // ₹15 eco-friendly chaat containers
  const estimatedFoodCost = Math.round(subtotal * variableCostRatio);
  const estimatedContribution = Math.max(
    0,
    finalAmount - taxAmount - estimatedFoodCost - packagingCost - (orderType === 'DELIVERY' ? deliveryFee * 0.7 : 0)
  );

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    deliveryFee,
    taxAmount,
    finalAmount,
    estimatedFoodCost,
    packagingCost,
    estimatedContribution,
  };
}
