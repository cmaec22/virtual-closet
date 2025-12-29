import { NextRequest, NextResponse } from 'next/server';
import { WardrobeService } from '@/lib/services/wardrobe';
import { createClothingItemSchema, listClothingItemsSchema } from '@/lib/validations/wardrobe';

/**
 * POST /api/wardrobe
 * Create a new clothing item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = createClothingItemSchema.parse(body);

    // Create item
    const item = WardrobeService.create(validatedData);

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating clothing item:', error);
    return NextResponse.json(
      { error: 'Failed to create clothing item' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/wardrobe
 * List all clothing items with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Parse query parameters
    const queryParams = {
      type: searchParams.get('type') || undefined,
      formality_level: searchParams.get('formality_level') || undefined,
      warmth_rating: searchParams.get('warmth_rating') || undefined,
      color: searchParams.get('color') || undefined,
      tag: searchParams.get('tag') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    // Validate query parameters
    const validatedParams = listClothingItemsSchema.parse(queryParams);

    // Get items
    const items = WardrobeService.getAll(validatedParams);
    const total = WardrobeService.count({
      type: validatedParams.type,
      formality_level: validatedParams.formality_level,
      warmth_rating: validatedParams.warmth_rating,
    });

    return NextResponse.json({
      items,
      total,
      limit: validatedParams.limit,
      offset: validatedParams.offset,
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error fetching clothing items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clothing items' },
      { status: 500 }
    );
  }
}
