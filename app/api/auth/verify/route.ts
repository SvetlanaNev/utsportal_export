import { NextResponse } from 'next/server';
import { findUserByToken, FieldSet } from '@/lib/airtable';
import { base } from '@/lib/airtable';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=Token+not+provided', request.url));
  }

  try {
    const user = await findUserByToken(token);

    if (!user) {
      return NextResponse.redirect(new URL('/?error=Invalid+token', request.url));
    }

    const tokenExpiresAt = user.record.get('Token Expires At');
    if (!tokenExpiresAt) {
      return NextResponse.redirect(new URL('/?error=Invalid+token+data', request.url));
    }

    const expiresAt = new Date(tokenExpiresAt as string);
    if (expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/?error=Token+expired', request.url));
    }

    // Clear the token in Airtable
    const fieldsToUpdate: FieldSet = {
      'Magic Link': undefined,
      'Token Expires At': undefined,
    };
    await base(user.table).update(user.record.id, fieldsToUpdate);

    const email = user.table === 'UTS Startups'
      ? user.record.get('Primary contact email')
      : user.record.get('Personal email*');

    if (!email) {
      return NextResponse.redirect(new URL('/?error=Email+not+found', request.url));
    }

    // Create session JWT
    const sessionToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    // Set cookie and redirect
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/?error=An+unexpected+error+occurred', request.url));
  }
} 