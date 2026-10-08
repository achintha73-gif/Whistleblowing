import { NextResponse } from 'next/server';
import { requireRole, UnauthorizedError, ForbiddenError } from '@/lib/auth';
import { listAllDepartments } from '@/features/users/repository/user-management.repository';

/**
 * GET /api/departments
 * Returns active departments for admin dropdowns.
 * Admin only.
 */
export async function GET() {
  try {
    await requireRole('ADMIN');

    const departments = await listAllDepartments();

    return NextResponse.json(
      {
        departments: departments.map((d) => ({
          departmentId: d.department_id,
          departmentName: d.department_name,
        })),
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[GET /api/departments]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}