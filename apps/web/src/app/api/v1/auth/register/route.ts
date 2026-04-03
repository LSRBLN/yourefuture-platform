import { NextRequest, NextResponse } from 'next/server';

import { resolveApiUrl } from '../../../../../lib/api-base-url';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ').trim() || body.email;

    const upstreamResponse = await fetch(resolveApiUrl('/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        fullName,
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
    console.error('Register error:', error);
    return NextResponse.json(
      { message: 'Registration failed' },
      { status: 500 }
    );
  }
}
