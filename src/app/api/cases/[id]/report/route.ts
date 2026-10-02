import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, UnauthorizedError } from '@/lib/auth';
import { upsertReportSchema } from '@/lib/validation';
import {
  getReportForCase,
  upsertReport,
} from '@/features/investigation/services/report.service';

/**
 * GET /api/cases/:id/report
 * Returns report for a case (or null if none).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const caseId = Number(id);
    if (!Number.isInteger(caseId) || caseId <= 0) {
      return NextResponse.json({ error: 'Invalid case ID' }, { status: 400 });
    }

    const report = await getReportForCase(user, caseId);
    return NextResponse.json({ report }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[GET /api/cases/:id/report]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cases/:id/report
 * Body: { findings, recommendation }
 * Creates or updates (upsert) the report.
 * Only assigned investigator.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const caseId = Number(id);
    if (!Number.isInteger(caseId) || caseId <= 0) {
      return NextResponse.json({ error: 'Invalid case ID' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = upsertReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await upsertReport(user, {
      caseId,
      findings: parsed.data.findings,
      recommendation: parsed.data.recommendation,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ report: result.report }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.error('[POST /api/cases/:id/report]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}