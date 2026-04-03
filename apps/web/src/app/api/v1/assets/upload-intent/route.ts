import { NextRequest, NextResponse } from 'next/server';

import { resolveApiUrl } from '../../../../../lib/api-base-url';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const body = await request.json();

    const upstreamResponse = await fetch(resolveApiUrl('/assets'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        assetType: 'image',
        mimeType: body.mimeType,
        fileSizeBytes: body.fileSize,
        originalFilename: body.filename,
      }),
      cache: 'no-store',
    });

    const contentType = upstreamResponse.headers.get('content-type') ?? 'application/json';
    const responseBody = await upstreamResponse.text();

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch (error) {
    console.error('Create asset upload intent proxy error:', error);
    return NextResponse.json({ message: 'Failed to create asset upload intent' }, { status: 500 });
  }
}

