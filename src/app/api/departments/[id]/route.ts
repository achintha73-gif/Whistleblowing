import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRole, UnauthorizedError, ForbiddenError } from '@/lib/auth';
import {
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from '@/features/users/services/department.service';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole('ADMIN');
    const { id } = await params;
    const departmentId = Number(id);
    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }

    const department = await getDepartmentById(user, departmentId);
    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ department }, { status: 200 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[GET /api/departments/:id]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

const updateSchema = z.object({
  departmentName: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).optional().nullable(),
  managerId: z.number().int().positive().optional().nullable(),
  status: z.enum(['active', 'inactive']).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole('ADMIN');
    const { id } = await params;
    const departmentId = Number(id);
    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await updateDepartment(user, departmentId, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { department: result.department },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('[PATCH /api/departments/:id]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole('ADMIN');
    const { id } = await params;
    const departmentId = Number(id);
    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { error: 'Invalid department ID' },
        { status: 400 }
      );
    }

    const result = await deleteDepartment(user, departmentId);
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
    console.error('[DELETE /api/departments/:id]', err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}