import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, UnauthorizedError, ForbiddenError } from '@/lib/auth';
import { listAllDepartments } from '@/features/users/repository/user-management.repository';
import { createDepartment } from '@/features/users/services/department.service';

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

// -------------------------------------------------------------
// POST - create new department (Admin only)
// -------------------------------------------------------------

const createSchema = z.object({
  departmentName: z.string().min(2).max(150),
  description: z.string().max(1000).optional().nullable(),
  managerId: z.number().int().positive().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole('ADMIN');
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await createDepartment(user, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(
      { department: result.department },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[POST /api/departments]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}