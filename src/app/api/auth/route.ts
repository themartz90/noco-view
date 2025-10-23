import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();
    const correctPasscode = process.env.AUTH_PASSCODE || '120290';

    if (passcode === correctPasscode) {
      const response = NextResponse.json({ success: true });

      // Set cookie for 90 days
      // Note: secure flag disabled because Cloudflare forces HTTPS anyway
      response.cookies.set('auth', 'authenticated', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax', // 'lax' is more compatible than 'strict'
        maxAge: 60 * 60 * 24 * 90, // 90 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
