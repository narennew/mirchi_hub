import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/data/store';

export async function GET() {
  try {
    const promos = dbStore.getPromos();
    return NextResponse.json({ success: true, promos });
  } catch (error) {
    console.error('API Error in GET /api/promos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.code || !body.discountValue) {
      return NextResponse.json(
        { success: false, error: 'Code and discountValue are required' },
        { status: 400 }
      );
    }

    const newPromo = dbStore.createPromo({
      code: body.code,
      description: body.description || '',
      discountType: body.discountType || 'PERCENTAGE',
      discountValue: Number(body.discountValue),
      minOrderValue: Number(body.minOrderValue || 0),
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : undefined,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json({ success: true, promo: newPromo }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/promos:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create promo' },
      { status: 500 }
    );
  }
}
