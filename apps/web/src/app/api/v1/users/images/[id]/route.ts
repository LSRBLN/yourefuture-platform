import { NextRequest, NextResponse } from 'next/server';
import { resolveApiUrl } from '../../../../../../lib/api-base-url';

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

    const upstreamResponse = await fetch(resolveApiUrl('/users/me/avatar'), {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
      },
      cache: 'no-store',
    });

    const contentType = upstreamResponse.headers.get('content-type') ?? 'application/json';
    const responseBody = await upstreamResponse.text();

    if (!responseBody && upstreamResponse.ok) {
      return NextResponse.json({ message: 'Image deleted successfully', id }, { status: 200 });
    }

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch (error) {
    console.error('Image delete error:', error);
    return NextResponse.json(
      { message: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
