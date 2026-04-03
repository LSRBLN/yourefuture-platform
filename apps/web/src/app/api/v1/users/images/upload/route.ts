import { NextRequest, NextResponse } from 'next/server';

import { resolveApiUrl } from '../../../../../../lib/api-base-url';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';

    if (!authHeader.startsWith('Bearer ')) {
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

    const uploadIntentResponse = await fetch(resolveApiUrl('/users/me/avatar/upload-intent'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        contentType: file.type,
        filename: file.name,
      }),
      cache: 'no-store',
    });

    if (!uploadIntentResponse.ok) {
      const errorBody = await uploadIntentResponse.text();
      return new NextResponse(errorBody || JSON.stringify({ message: 'Failed to create upload intent' }), {
        status: uploadIntentResponse.status,
        headers: {
          'content-type': uploadIntentResponse.headers.get('content-type') ?? 'application/json',
        },
      });
    }

    const uploadIntent = await uploadIntentResponse.json() as {
      imageId?: string;
      upload?: {
        uploadUrl?: string;
        url?: string;
        presignedUrl?: string;
        headers?: Record<string, string>;
      };
    };

    const presignedUrl =
      uploadIntent.upload?.uploadUrl ??
      uploadIntent.upload?.url ??
      uploadIntent.upload?.presignedUrl;

    if (!uploadIntent.imageId || !presignedUrl) {
      return NextResponse.json(
        { message: 'Upload intent response missing imageId or upload URL' },
        { status: 502 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const putHeaders = {
      ...(uploadIntent.upload?.headers ?? {}),
      'Content-Type': file.type,
    };

    const putResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: putHeaders,
      body: fileBuffer,
    });

    if (!putResponse.ok) {
      return NextResponse.json(
        { message: `Storage upload failed: ${putResponse.status}` },
        { status: 502 }
      );
    }

    const avatarResponse = await fetch(resolveApiUrl('/users/me/avatar'), {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
      cache: 'no-store',
    });

    const avatarJson = avatarResponse.ok ? await avatarResponse.json() as { view?: { url?: string; uploadUrl?: string } | string } : null;
    const imageUrl = typeof avatarJson?.view === 'string'
      ? avatarJson.view
      : (avatarJson?.view?.url ?? avatarJson?.view?.uploadUrl ?? '');

    return NextResponse.json(
      {
        id: uploadIntent.imageId,
        filename: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        imageUrl,
        isPrimary: true,
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
