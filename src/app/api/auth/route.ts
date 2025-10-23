import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { passcode } = await request.json();
    const correctPasscode = process.env.AUTH_PASSCODE || '120290';

    if (passcode === correctPasscode) {
      const response = NextResponse.json({ success: true });

      // Check multiple indicators for HTTPS
      const forwardedProto = request.headers.get('x-forwarded-proto');
      const host = request.headers.get('host') || '';
      const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

      // Only use secure cookies when:
      // 1. x-forwarded-proto is explicitly 'https' (Cloudflare), OR
      // 2. Not localhost AND NODE_ENV is production
      const isSecure = forwardedProto === 'https' || (!isLocalhost && process.env.NODE_ENV === 'production');

      // Set cookie for 90 days
      response.cookies.set('auth', 'authenticated', {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'strict',
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
