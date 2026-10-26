import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/data/store';
import { DELIVERY_PROVIDERS } from '@/lib/delivery';

export async function GET() {
  try {
    const settings = dbStore.getSettings();
    return NextResponse.json({
      success: true,
      settings,
      deliveryProviders: DELIVERY_PROVIDERS,
    });
  } catch (error) {
    console.error('API Error in GET /api/admin/config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const updated = dbStore.updateSettings(body);
    return NextResponse.json({
      success: true,
      settings: updated,
      message: 'Store configuration updated successfully',
    });
  } catch (error) {
    console.error('API Error in POST /api/admin/config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}
