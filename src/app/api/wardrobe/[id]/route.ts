import { NextRequest, NextResponse } from 'next/server';
import { WardrobeService } from '@/lib/services/wardrobe';
import { updateClothingItemSchema } from '@/lib/validations/wardrobe';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/wardrobe/[id]
 * Get a single clothing item by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const item = WardrobeService.getById(itemId);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching clothing item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clothing item' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/wardrobe/[id]
 * Update a clothing item
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = updateClothingItemSchema.parse(body);

    // Update item
    const item = WardrobeService.update(itemId, validatedData);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating clothing item:', error);
    return NextResponse.json(
      { error: 'Failed to update clothing item' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wardrobe/[id]
 * Delete a clothing item
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const itemId = parseInt(id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: 'Invalid item ID' },
        { status: 400 }
      );
    }

    const success = WardrobeService.delete(itemId);

    if (!success) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting clothing item:', error);
    return NextResponse.json(
      { error: 'Failed to delete clothing item' },
      { status: 500 }
    );
  }
}
