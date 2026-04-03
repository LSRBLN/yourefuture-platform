import { NextRequest, NextResponse } from 'next/server';

import { resolveApiUrl } from '../../../../../lib/api-base-url';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const upstreamResponse = await fetch(resolveApiUrl('/users/me'), {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
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
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const body = await request.json();
    const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ').trim();

    const upstreamResponse = await fetch(resolveApiUrl('/users/me'), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        fullName: fullName || undefined,
        locale: body.language,
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
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
