import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/data/store';
import { OrderStatus } from '@/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('API Error in GET /api/orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, deliveryProvider, deliveryTrackingRef, deliveryTrackingUrl, cancellationReason } = body;

    const validStatuses: OrderStatus[] = [
      'PLACED',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid order status: ${status}` },
        { status: 400 }
      );
    }

    const updated = dbStore.updateOrderStatus(id, status, {
      deliveryProvider,
      deliveryTrackingRef,
      deliveryTrackingUrl,
      cancellationReason,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Order not found to update' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updated,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error('API Error in PATCH /api/orders/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
