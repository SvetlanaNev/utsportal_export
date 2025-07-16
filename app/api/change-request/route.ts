import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { base } from '@/lib/airtable';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

interface JwtPayload {
  email: string;
}

interface ChangeRequestBody {
  table: string;
  recordId: string;
  changes: object;
  reason: string;
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get('cookie');
  const sessionCookie = cookieHeader?.split('; ').find(c => c.startsWith('session='))?.split('=')[1];

  if (!sessionCookie) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email: userEmail } = jwt.verify(sessionCookie, process.env.JWT_SECRET!) as JwtPayload;

    const { table, recordId, changes, reason }: ChangeRequestBody = await request.json();

    if (!table || !recordId || !changes || !reason) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Update Airtable record
    await base(table).update([
      {
        id: recordId,
        fields: changes,
      },
    ]);

    // Log change to Postgres
    await prisma.changeRequest.create({
      data: {
        userEmail,
        recordId,
        changes: JSON.stringify(changes),
        reason,
      },
    });

    return NextResponse.json({ message: 'Change request submitted successfully.' });
  } catch (error) {
    console.error('Change request error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
} 