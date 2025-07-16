import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDashboardData } from '@/lib/airtable';

export const runtime = 'nodejs';

interface JwtPayload {
  email: string;
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const sessionCookie = cookieHeader?.split('; ').find(c => c.startsWith('session='))?.split('=')[1];

  if (!sessionCookie) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = jwt.verify(sessionCookie, process.env.JWT_SECRET!) as JwtPayload;

    const dashboardData = await getDashboardData(email);

    if (!dashboardData) {
      return NextResponse.json({ message: 'User data not found.' }, { status: 404 });
    }

    return NextResponse.json({ ...dashboardData, userEmail: email });
  } catch (error) {
    console.error('JWT verification or data fetching error:', error);
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
} 