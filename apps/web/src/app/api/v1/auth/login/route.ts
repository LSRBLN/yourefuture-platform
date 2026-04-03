import { NextRequest, NextResponse } from 'next/server';

import { resolveApiUrl } from '../../../../../lib/api-base-url';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const upstreamResponse = await fetch(resolveApiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}
