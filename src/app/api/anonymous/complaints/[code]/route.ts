import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  normalizeReferenceCode,
  isValidReferenceCode,
} from '@/lib/reference-code';

/**
 * GET /api/anonymous/complaints/:code
 * PUBLIC — no auth required.
 * Fetch an anonymous complaint by reference code.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const normalized = normalizeReferenceCode(decodeURIComponent(code));

    if (!isValidReferenceCode(normalized)) {
      return NextResponse.json(
        { error: 'Invalid reference code format' },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { reference_code: normalized },
      include: {
        additionalInfo: {
          orderBy: { submitted_at: 'desc' },
          select: {
            info_id: true,
            title: true,
            description: true,
            informationType: true,
            submitted_at: true,
          },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'No complaint found with that reference code' },
        { status: 404 }
      );
    }

    // Only allow tracking anonymous complaints this way
    if (!complaint.isAnonymous || complaint.user_id !== null) {
      return NextResponse.json(
        { error: 'This complaint cannot be tracked by code' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      complaint: {
        complaintId: complaint.complaint_id,
        referenceCode: complaint.reference_code,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        status: complaint.status,
        isAnonymous: complaint.isAnonymous,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at,
        additionalInfo: complaint.additionalInfo.map((a) => ({
          infoId: a.info_id,
          title: a.title,
          description: a.description,
          informationType: a.informationType,
          submittedAt: a.submitted_at,
        })),
      },
    });
  } catch (err) {
    console.error('[GET /api/anonymous/complaints/:code]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}