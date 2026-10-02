import { NextRequest, NextResponse } from 'next/server';
import { requireRole, UnauthorizedError, ForbiddenError } from '@/lib/auth';
import {
  getEditableSettings,
  updateSettings,
} from '@/features/settings/services/settings.service';

/**
 * GET /api/settings
 * Returns editable settings.
 * ADMIN only.
 */
export async function GET() {
  try {
    await requireRole('ADMIN');
    const settings = await getEditableSettings();
    return NextResponse.json({ settings }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[GET /api/settings]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings
 * Body: { siteName, supportEmail, maxUploadMb }
 * ADMIN only.
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole('ADMIN');

    const body = await request.json();

    const result = await updateSettings(user, {
      siteName: String(body.siteName ?? ''),
      supportEmail: String(body.supportEmail ?? ''),
      maxUploadMb: Number(body.maxUploadMb),
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[PATCH /api/settings]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}