import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/data/store';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const promo = dbStore.getPromoByCode(code);
    if (!promo) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired coupon code' },
        { status: 404 }
      );
    }

    if (subtotal !== undefined && subtotal < promo.minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order value of ₹${promo.minOrderValue} required for coupon ${promo.code}. Add ₹${promo.minOrderValue - subtotal} more to apply!`,
        },
        { status: 400 }
      );
    }

    let calculatedDiscount = 0;
    if (promo.discountType === 'PERCENTAGE') {
      calculatedDiscount = (subtotal * promo.discountValue) / 100;
      if (promo.maxDiscount) {
        calculatedDiscount = Math.min(calculatedDiscount, promo.maxDiscount);
      }
    } else {
      calculatedDiscount = promo.discountValue;
    }

    return NextResponse.json({
      success: true,
      promo,
      discountAmount: Math.min(calculatedDiscount, subtotal || calculatedDiscount),
    });
  } catch (error) {
    console.error('API Error in /api/promos/validate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}
