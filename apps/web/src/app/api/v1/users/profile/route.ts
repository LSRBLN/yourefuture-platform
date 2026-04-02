import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Verify token and fetch user profile from database
    // For now, return mock response
    const mockUser = {
      id: `user_mock`,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Security researcher interested in OSINT',
      language: 'de',
      theme: 'dark',
      images: [
        {
          id: 'img_1',
          filename: 'avatar.jpg',
          imageUrl: 'https://via.placeholder.com/150',
          isPrimary: true,
        },
      ],
    };

    return NextResponse.json(mockUser);
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
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // TODO: Update user profile in database
    const updatedUser = {
      id: `user_mock`,
      ...body,
    };

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
