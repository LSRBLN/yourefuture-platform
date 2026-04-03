import { NextRequest, NextResponse } from 'next/server';

import { resolveApiUrl } from '../../../../lib/api-base-url';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const body = await request.text();

    const upstreamResponse = await fetch(resolveApiUrl('/checks'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body,
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
    console.error('Create check proxy error:', error);
    return NextResponse.json({ message: 'Failed to create check' }, { status: 500 });
  }
}

