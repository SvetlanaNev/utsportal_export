import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/airtable';
import { randomUUID } from 'crypto';
import { base } from '@/lib/airtable';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await findUserByEmail(email);

    if (!user) {
      // To prevent email enumeration, we return a success message even if the user is not found.
      // The email sending is handled by an Airtable automation, which will simply not fire if no token is generated.
      return NextResponse.json({ message: 'If your email is in our system, you will receive a login link shortly.' });
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await base(user.table).update([
      {
        id: user.record.id,
        fields: {
          'Magic Link Token': token,
          'Token Expires At': expiresAt.toISOString(),
        },
      },
    ]);

    return NextResponse.json({ message: 'If your email is in our system, you will receive a login link shortly.' });
  } catch (error) {
    console.error('[LOGIN_REQUEST_ERROR]', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
} 