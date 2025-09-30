import { NextRequest, NextResponse } from 'next/server';
import { updateCategoriesOrder } from '@/lib/db/shared-db';

export async function POST(request: NextRequest) {
  try {
    const { categories } = await request.json();

    if (!categories || !Array.isArray(categories)) {
      return NextResponse.json({ error: 'Invalid categories data' }, { status: 400 });
    }

    // Validate that each category has id and sort_order
    for (const cat of categories) {
      if (!cat.id || typeof cat.sort_order !== 'number') {
        return NextResponse.json({ error: 'Invalid category format' }, { status: 400 });
      }
    }

    await updateCategoriesOrder(categories);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering categories:', error);
    return NextResponse.json({ error: 'Failed to reorder categories' }, { status: 500 });
  }
}