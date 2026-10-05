import { NextResponse } from 'next/server';
import { z } from 'zod';
import { trackComplaintByCode } from '@/features/complaints/services/anonymous.service';

const TrackSchema = z.object({
  code: z.string().min(5, 'Invalid reference code'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = TrackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid code' },
        { status: 400 }
      );
    }

    const complaint = await trackComplaintByCode(parsed.data.code);

    if (!complaint) {
      return NextResponse.json(
        { error: 'No complaint found with that reference code' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('[Track Complaint API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
