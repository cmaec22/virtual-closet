import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/utils/upload';

/**
 * POST /api/upload
 * Upload an image file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const result = await uploadImage(file);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ path: result.path }, { status: 201 });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
