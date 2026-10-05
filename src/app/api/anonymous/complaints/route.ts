import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAnonymousComplaint } from '@/features/complaints/services/anonymous.service';

const AnonymousComplaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters'),
  category: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = AnonymousComplaintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            parsed.error.issues[0]?.message || 'Invalid complaint data',
        },
        { status: 400 }
      );
    }

    const result = await createAnonymousComplaint(parsed.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        success: true,
        complaintId: result.complaintId,
        referenceCode: result.referenceCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Anonymous Complaint API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
