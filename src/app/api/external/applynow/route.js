import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

function checkAuth(req) {
  const authHeader = req.headers.get('authorization');
  const token = process.env.API_SECRET_TOKEN;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== token) {
    return false;
  }
  return true;
}

// GET with filtering, pagination, and search
export async function GET(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const quality_status = searchParams.get('quality_status');
    const choosable_status = searchParams.get('choosable_status');
    const user_id = searchParams.get('user_id');
    const user_ids = searchParams.get('user_ids');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    const where = {};
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
    // user_id/user_ids/assignment logic skipped (not in schema)
    const orderBy = [
      { created_at: 'desc' },
    ];
    const [total, records] = await Promise.all([
      prisma.apply_now.count({ where }),
      prisma.apply_now.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ]);
    return NextResponse.json({ success: true, data: records, total, page, pageSize });
  } catch (error) {
    console.error('GET /api/applyNow error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Save application
export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();    
    const { name, city, email, phone_number, last_education, intrested_country } = body;
    const newApplication = await prisma.apply_now.create({
      data: {
        name,
        city,
        email,
        phone_number,
        last_education,
        intrested_country,
      },
    });
    return NextResponse.json({ success: true, data: newApplication }, { status: 201 });
  } catch (error) {
    console.error('POST /api/applyNow error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}