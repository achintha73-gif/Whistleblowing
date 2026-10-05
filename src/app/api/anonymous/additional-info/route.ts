import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addAnonymousAdditionalInfo } from '@/features/complaints/services/anonymous.service';

const Schema = z.object({
  referenceCode: z.string().min(5),
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  informationType: z.enum([
    'ADDITIONAL_DETAILS',
    'CLARIFICATION',
    'SUPPORTING_INFO',
    'CORRECTION',
  ]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid data' },
        { status: 400 }
      );
    }

    const result = await addAnonymousAdditionalInfo(parsed.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, infoId: result.infoId },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Anonymous Additional Info API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
