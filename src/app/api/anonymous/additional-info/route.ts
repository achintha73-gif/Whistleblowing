import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  normalizeReferenceCode,
  isValidReferenceCode,
} from '@/lib/reference-code';

/**
 * POST /api/anonymous/additional-info
 * PUBLIC — no auth required.
 *
 * Body: JSON
 *   - referenceCode: string
 *   - title: string
 *   - description: string
 *   - informationType: 'ADDITIONAL_DETAILS' | 'CLARIFICATION' | 'SUPPORTING_INFO' | 'CORRECTION'
 *
 * Adds additional information to an anonymous complaint,
 * verified by reference code.
 */

const VALID_TYPES = [
  'ADDITIONAL_DETAILS',
  'CLARIFICATION',
  'SUPPORTING_INFO',
  'CORRECTION',
] as const;

type InfoType = (typeof VALID_TYPES)[number];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rawCode = String(body.referenceCode ?? '');
    const code = normalizeReferenceCode(decodeURIComponent(rawCode));

    if (!isValidReferenceCode(code)) {
      return NextResponse.json(
        { error: 'Invalid reference code' },
        { status: 400 }
      );
    }

    const title = String(body.title ?? '').trim();
    const description = String(body.description ?? '').trim();
    const informationType = String(
      body.informationType ?? 'ADDITIONAL_DETAILS'
    ) as InfoType;

    if (title.length < 3 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be 3-200 characters' },
        { status: 400 }
      );
    }
    if (description.length < 10 || description.length > 3000) {
      return NextResponse.json(
        { error: 'Description must be 10-3000 characters' },
        { status: 400 }
      );
    }
    if (!VALID_TYPES.includes(informationType)) {
      return NextResponse.json(
        { error: 'Invalid information type' },
        { status: 400 }
      );
    }

    // Find the complaint
    const complaint = await prisma.complaint.findUnique({
      where: { reference_code: code },
      select: {
        complaint_id: true,
        user_id: true,
        isAnonymous: true,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'No complaint found with that reference code' },
        { status: 404 }
      );
    }

    if (!complaint.isAnonymous || complaint.user_id !== null) {
      return NextResponse.json(
        { error: 'This complaint cannot be updated by code' },
        { status: 403 }
      );
    }

    // We need a `submitted_by` user_id — but anonymous has none.
    // Solution: use the system admin user (id = 1) as a proxy for
    // anonymous submissions. This is documented behavior.
    // Alternative: make submitted_by nullable (schema change).
    // For simplicity, use admin id 1.
    const systemAdmin = await prisma.user.findFirst({
      where: { role: { role_name: 'ADMIN' } },
      select: { user_id: true },
    });

    if (!systemAdmin) {
      return NextResponse.json(
        { error: 'System misconfigured' },
        { status: 500 }
      );
    }

    const created = await prisma.additionalInformation.create({
      data: {
        complaint_id: complaint.complaint_id,
        title,
        description,
        informationType,
        submitted_by: systemAdmin.user_id,
      },
    });

    return NextResponse.json(
      {
        additionalInfo: {
          infoId: created.info_id,
          title: created.title,
          description: created.description,
          informationType: created.informationType,
          submittedAt: created.submitted_at,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[POST /api/anonymous/additional-info]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}