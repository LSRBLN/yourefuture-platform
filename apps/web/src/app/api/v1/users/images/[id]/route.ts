import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // TODO: Delete image from database and storage
    return NextResponse.json(
      { message: 'Image deleted successfully', id },
      { status: 200 }
    );
  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json(
      { message: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
