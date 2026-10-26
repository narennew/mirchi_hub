import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/data/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category') || undefined;
    const searchQuery = searchParams.get('q') || undefined;
    const spiceLevel = searchParams.get('spice') || undefined;
    const onlyAvailable = searchParams.get('available') === 'true';

    const categories = dbStore.getCategories();
    const items = dbStore.getMenuItems({
      categorySlug,
      searchQuery,
      spiceLevel,
      onlyAvailable,
    });

    return NextResponse.json({
      success: true,
      categories,
      items,
      totalCount: items.length,
    });
  } catch (error) {
    console.error('API Error in GET /api/menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve menu catalogue' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.price || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const newItem = dbStore.createMenuItem({
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      category: body.category || 'Mirchi Chaats',
      categoryId: body.categoryId,
      price: Number(body.price),
      description: body.description || '',
      imageUrl: body.imageUrl || '/images/hero.jpg',
      isVegetarian: body.isVegetarian !== undefined ? body.isVegetarian : true,
      spiceLevel: body.spiceLevel || 'Medium',
      isBestseller: !!body.isBestseller,
      isAvailable: body.isAvailable !== undefined ? body.isAvailable : true,
      isVerified: true, // Items created by admin directly are verified
      estimatedCost: Number(body.estimatedCost || (body.price * 0.35)),
      availableCustomizations: body.availableCustomizations || [],
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error('API Error in POST /api/menu:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create menu item' },
      { status: 500 }
    );
  }
}
