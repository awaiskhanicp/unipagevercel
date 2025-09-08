import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

function checkAuth(req) {
  const authHeader = req.headers.get('authorization');
  const token = process.env.API_SECRET_TOKEN;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== token) {
    return false;
  }
  return true;
}

// GET all consultations with filtering, pagination, and search
export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50'); // Default 50 per page

    // Filters from Laravel logic
    const search = searchParams.get('search') || '';
    const quality_status = searchParams.get('quality_status');
    const choosable_status = searchParams.get('choosable_status');
    const user_id = searchParams.get('user_id');
    const user_ids = searchParams.get('user_ids');
    const interested_country = searchParams.get('interested_country');
    const assiged_not_assigned_status = searchParams.get('assiged_not_assigned_status');
    const assigned_start_date = searchParams.get('assigned_start_date');
    const assigned_end_date = searchParams.get('assigned_end_date');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    // Build where clause
    const where = {};

    // Search (name, email, phone_number, city)
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone_number: { contains: search } },
        { city: { contains: search } },
      ];
    }
    if (quality_status) where.quality_status = quality_status;
    if (choosable_status) where.choosable_status = choosable_status;
    if (interested_country) where.interested_country = interested_country;

    // Date range filters
    if (assigned_start_date || assigned_end_date) {
      where.assigned_date = {};
      if (assigned_start_date) where.assigned_date.gte = new Date(assigned_start_date);
      if (assigned_end_date) where.assigned_date.lte = new Date(assigned_end_date);
    }
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) {
        const d = new Date(from_date);
        if (!isNaN(d)) where.created_at.gte = d;
      }
      if (to_date) {
        const d = new Date(to_date);
        if (!isNaN(d)) where.created_at.lte = d;
      }
    }

    // Assignment status
    if (assiged_not_assigned_status === '1') {
      // Assigned
      where.AND = [
        ...(where.AND || []),
        { assigned_employees: { not: null } },
        { assigned_employees: { not: '' } },
      ];
    } else if (assiged_not_assigned_status === '0') {
      // Not assigned
      where.OR = [
        ...(where.OR || []),
        { assigned_employees: null },
        { assigned_employees: '' },
      ];
    }

    // user_id filter (exact match in assigned_employees string)
    if (user_id) {
      // Match as CSV: ",id,", "id,", ",id", "id"
      where.OR = [
        ...(where.OR || []),
        { assigned_employees: { contains: `,${user_id},` } },
        { assigned_employees: { startsWith: `${user_id},` } },
        { assigned_employees: { endsWith: `,${user_id}` } },
        { assigned_employees: user_id },
      ];
    }

    // user_ids filter (comma separated, for permission logic)
    if (user_ids) {
      const ids = user_ids.split(',').map(id => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        where.OR = [
          ...(where.OR || []),
          ...ids.map(id => ({
            OR: [
              { assigned_employees: { contains: `,${id},` } },
              { assigned_employees: { startsWith: `${id},` } },
              { assigned_employees: { endsWith: `,${id}` } },
              { assigned_employees: id },
            ]
          })),
        ];
      }
    }

    // Order by assigned_date desc, then created_at desc
    const orderBy = [
      { assigned_date: 'desc' },
      { created_at: 'desc' },
    ];

    // Query total and paginated records
    const [total, records] = await Promise.all([
      prisma.free_consulations.count({ where }),
      prisma.free_consulations.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ]);
    return NextResponse.json({ success: true, data: records, total, page, pageSize });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch consultations',
        message: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}

// POST create new consultation
export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.email || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingRecord = await prisma.free_consulations.findUnique({
      where: { email: body.email }
    });

    if (existingRecord) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email already exists',
          message: 'This email has already been used for a consultation'
        },
        { status: 409 } // Conflict status code
      );
    }

    // Create new record
    const record = await prisma.free_consulations.create({ 
      data: {
        ...body,
        created_at: new Date() // Ensure created_at is set
      }
    });

    return NextResponse.json(
      { success: true, data: record }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("POST error:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Duplicate entry',
          message: 'This email is already registered for a consultation'
        },
        { status: 409 }
      );
    }

    // Generic error handler
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create consultation',
        message: process.env.NODE_ENV === 'development' ? error.message : null
      },
      { status: 500 }
    );
  }
}

// Manual/auto assignment endpoint
// export async function POST_assign(req) {
//   if (!checkAuth(req)) {
//     return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
//   }
//   try {
//     const body = await req.json();
//     // TODO: Implement assignment logic (manual/auto)
//     console.log('Assigning consultation:', body);
//     return NextResponse.json({ success: true, message: 'Assignment logic placeholder' });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: 'Assignment failed' }, { status: 500 });
//   }
// }

// // Send email if not_connected endpoint
// export async function POST_send_email(req) {
//   if (!checkAuth(req)) {
//     return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
//   }
//   try {
//     const body = await req.json();
//     // TODO: Implement email sending logic
//     console.log('Send email for not_connected:', body);
//     return NextResponse.json({ success: true, message: 'Email logic placeholder' });
//   } catch (error) {
//     return NextResponse.json({ success: false, error: 'Email send failed' }, { status: 500 });
//   }
// }