import { describe, it, expect } from 'vitest';
import { dbStore } from '../src/lib/data/store';

describe('Orders and Store Repository', () => {
  it('retrieves official menu card categories and dishes', () => {
    const categories = dbStore.getCategories();
    expect(categories.length).toBeGreaterThan(0);

    const items = dbStore.getMenuItems();
    expect(items.length).toBeGreaterThanOrEqual(25);

    // Verify Masala Puri price is ₹50 from official menu card
    const masalaPuri = items.find((i) => i.name === 'Masala Puri');
    expect(masalaPuri?.price).toBe(50);

    // Verify Cheese Pav Bhaji is ₹120 from official menu card
    const cheesePavBhaji = items.find((i) => i.name === 'Cheese Pav Bhaji');
    expect(cheesePavBhaji?.price).toBe(120);
  });

  it('filters items by search query and spice level', () => {
    const bhelSearch = dbStore.getMenuItems({ searchQuery: 'Bhel' });
    expect(bhelSearch.some((i) => i.name === 'Masala Bhel')).toBe(true);

    const mildItems = dbStore.getMenuItems({ spiceLevel: 'Mild' });
    mildItems.forEach((item) => {
      expect(item.spiceLevel).toBe('Mild');
    });
  });

  it('creates an order, generates a unique order number, and updates status', () => {
    const newOrder = dbStore.createOrder({
      customerName: 'Priya Sundaram',
      customerPhone: '+91 98430 11223',
      orderType: 'DELIVERY',
      status: 'PLACED',
      deliveryAddress: '32, Vysial Street, Coimbatore',
      subtotal: 105,
      discountAmount: 0,
      deliveryFee: 30,
      taxAmount: 5.25,
      finalAmount: 140,
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      items: [
        {
          id: 'test-item-1',
          productId: 'item-masala-puri',
          productName: 'Masala Puri',
          unitPrice: 50,
          quantity: 1,
          subtotal: 50,
        },
        {
          id: 'test-item-2',
          productId: 'item-masala-samosa',
          productName: 'Masala Samosa',
          unitPrice: 55,
          quantity: 1,
          subtotal: 55,
        },
      ],
    });

    expect(newOrder.id).toBeDefined();
    expect(newOrder.orderNumber).toMatch(/^MC-2026-\d+/);
    expect(newOrder.status).toBe('PLACED');

    // Transition to ACCEPTED -> PREPARING -> OUT_FOR_DELIVERY -> DELIVERED
    const acceptedOrder = dbStore.updateOrderStatus(newOrder.id, 'ACCEPTED');
    expect(acceptedOrder?.status).toBe('ACCEPTED');

    const dispatchedOrder = dbStore.updateOrderStatus(newOrder.id, 'OUT_FOR_DELIVERY', {
      deliveryProvider: 'Shop In-House Delivery (Town Hall Fleet)',
      deliveryTrackingRef: 'RIDER-RAMESH-88',
    });
    expect(dispatchedOrder?.status).toBe('OUT_FOR_DELIVERY');
    expect(dispatchedOrder?.deliveryTrackingRef).toBe('RIDER-RAMESH-88');

    // Retrieve order by number
    const retrieved = dbStore.getOrderById(newOrder.orderNumber);
    expect(retrieved?.id).toBe(newOrder.id);
  });

  it('updates product details and price', () => {
    const item = dbStore.getMenuItemById('item-masala-puri');
    expect(item).toBeDefined();

    // Admin updates price
    const updated = dbStore.updateMenuItem('item-masala-puri', {
      price: 55,
    });
    expect(updated?.price).toBe(55);

    // Revert back to official menu card price 50
    dbStore.updateMenuItem('item-masala-puri', {
      price: 50,
    });
  });

  it('calculates real-time store analytics', () => {
    const analytics = dbStore.getAnalytics();
    expect(analytics.totalOrders).toBeGreaterThanOrEqual(1);
    expect(analytics.totalRevenue).toBeGreaterThan(0);
    expect(analytics.averageOrderValue).toBeGreaterThan(0);
    expect(analytics.estimatedContribution).toBeGreaterThanOrEqual(0);
  });
});
