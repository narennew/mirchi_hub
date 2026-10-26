import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/data/store';

export async function GET() {
  try {
    const analytics = dbStore.getAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error('API Error in GET /api/admin/analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analytics data' },
      { status: 500 }
    );
  }
}
