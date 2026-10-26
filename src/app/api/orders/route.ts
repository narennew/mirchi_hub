import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/data/store';
import { calculateOrderTotals } from '@/lib/pricing';
import { calculateDeliveryFee } from '@/lib/delivery';
import { CartItem, OrderStatus, OrderType, PaymentMethod } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus | undefined;
    const search = searchParams.get('q') || undefined;

    const orders = dbStore.getOrders({ status: status || undefined, search });
    return NextResponse.json({ success: true, orders, count: orders.length });
  } catch (error) {
    console.error('API Error in GET /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      orderType = 'DELIVERY',
      deliveryAddress,
      pincode,
      landmark,
      orderNotes,
      items,
      promoCode,
      paymentMethod = 'ONLINE',
      distanceKm = 2.5,
    } = body;

    // 1. Basic validation
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Customer name and phone number are required.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty. Please add items to checkout.' },
        { status: 400 }
      );
    }

    if (orderType === 'DELIVERY' && (!deliveryAddress || deliveryAddress.trim().length < 5)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid delivery address in Coimbatore.' },
        { status: 400 }
      );
    }

    // 2. Validate items against database for availability & authoritative pricing
    const validatedCartItems: CartItem[] = [];
    const orderItems = [];

    for (const item of items) {
      const dbItem = dbStore.getMenuItemById(item.menuItemId || item.productId);
      if (!dbItem) {
        return NextResponse.json(
          { success: false, error: `Item "${item.name}" was not found in the menu.` },
          { status: 400 }
        );
      }

      if (!dbItem.isAvailable) {
        return NextResponse.json(
          {
            success: false,
            error: `"${dbItem.name}" is currently sold out. Please remove it from your cart to proceed.`,
          },
          { status: 400 }
        );
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      
      // Calculate addons
      const addons = Array.isArray(item.selectedCustomizations)
        ? item.selectedCustomizations
        : [];
      const addonsPrice = addons.reduce((sum: number, a: { price: number }) => sum + (Number(a.price) || 0), 0);
      const unitTotal = dbItem.price + addonsPrice;
      const lineTotal = unitTotal * qty;

      validatedCartItems.push({
        id: item.id || `cart-${Date.now()}-${Math.random()}`,
        menuItemId: dbItem.id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: qty,
        selectedSpice: item.selectedSpice || dbItem.spiceLevel,
        selectedCustomizations: addons,
        imageUrl: dbItem.imageUrl,
        notes: item.notes,
      });

      orderItems.push({
        id: `ord-item-${Date.now()}-${Math.random()}`,
        productId: dbItem.id,
        productName: dbItem.name,
        unitPrice: unitTotal,
        quantity: qty,
        subtotal: lineTotal,
        selectedSpice: item.selectedSpice || dbItem.spiceLevel,
        customizations: addons,
      });
    }

    // 3. Check delivery radius if DELIVERY
    const settings = dbStore.getSettings();
    if (orderType === 'DELIVERY') {
      const deliveryCheck = calculateDeliveryFee(
        0,
        distanceKm,
        settings.baseDeliveryFee,
        settings.deliveryRadiusKm,
        settings.freeDeliveryThreshold
      );
      if (!deliveryCheck.isDeliverable) {
        return NextResponse.json(
          { success: false, error: deliveryCheck.reason },
          { status: 400 }
        );
      }
    }

    // 4. Validate promo code if applied
    let appliedPromo = null;
    if (promoCode) {
      const foundPromo = dbStore.getPromoByCode(promoCode);
      if (foundPromo && foundPromo.isActive) {
        appliedPromo = foundPromo;
      }
    }

    // 5. Server-side authoritative calculation
    const calc = calculateOrderTotals({
      items: validatedCartItems,
      orderType: orderType as OrderType,
      appliedPromo,
      distanceKm,
      baseDeliveryFee: settings.baseDeliveryFee,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      gstRate: settings.gstPercentage / 100,
      variableCostRatio: settings.variableCostRatio,
    });

    // 6. Payment status logic
    const isOnline = paymentMethod === 'ONLINE';
    const paymentStatus = isOnline ? 'PAID' : 'PENDING';
    const paymentGatewayRef = isOnline ? `rzp_direct_${Date.now()}` : undefined;

    // 7. Create Order in DB
    const newOrder = dbStore.createOrder({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      orderType: orderType as OrderType,
      status: 'PLACED',
      deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
      pincode: pincode || undefined,
      landmark: landmark || undefined,
      orderNotes: orderNotes || undefined,
      subtotal: calc.subtotal,
      discountAmount: calc.discountAmount,
      appliedPromo: appliedPromo ? appliedPromo.code : undefined,
      deliveryFee: calc.deliveryFee,
      taxAmount: calc.taxAmount,
      finalAmount: calc.finalAmount,
      paymentMethod: paymentMethod as PaymentMethod,
      paymentStatus,
      paymentGatewayRef,
      deliveryProvider: orderType === 'DELIVERY' ? settings.activeDeliveryProvider : undefined,
      items: orderItems,
    });

    return NextResponse.json({
      success: true,
      order: newOrder,
      message: 'Order placed successfully!',
    });
  } catch (error) {
    console.error('API Error in POST /api/orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process checkout and place order.' },
      { status: 500 }
    );
  }
}
