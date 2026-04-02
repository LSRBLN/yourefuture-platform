import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validiere Dateityp
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validiere Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size must not exceed 5MB' },
        { status: 400 }
      );
    }

    // TODO: Upload file to storage (S3, local filesystem, etc.)
    // For now, return mock response
    const mockImageId = `img_${Date.now()}`;
    const mockImageUrl = URL.createObjectURL(file);

    return NextResponse.json(
      {
        id: mockImageId,
        filename: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        imageUrl: `https://via.placeholder.com/300?text=${file.name}`,
        isPrimary: false,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { message: 'Image upload failed' },
      { status: 500 }
    );
  }
}
