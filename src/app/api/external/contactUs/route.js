import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

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
    const assiged_not_assigned_status = searchParams.get('assiged_not_assigned_status');
    const assigned_start_date = searchParams.get('assigned_start_date');
    const assigned_end_date = searchParams.get('assigned_end_date');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    const where = {};
    if (search) {
      where.OR = [
        { user_name: { contains: search } },
        { user_email: { contains: search } },
        { phone_number: { contains: search } },
        { office_location: { contains: search } },
        { message: { contains: search } },
      ];
    }
    if (quality_status) where.quality_status = quality_status;
    if (choosable_status) where.choosable_status = choosable_status === '1' || choosable_status === 'true';
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
    if (assiged_not_assigned_status === '1') {
      where.AND = [
        ...(where.AND || []),
        { assigned_employees: { not: null } },
        { assigned_employees: { not: '' } },
      ];
    } else if (assiged_not_assigned_status === '0') {
      where.OR = [
        ...(where.OR || []),
        { assigned_employees: null },
        { assigned_employees: '' },
      ];
    }
    if (user_id) {
      where.OR = [
        ...(where.OR || []),
        { assigned_employees: { contains: `,${user_id},` } },
        { assigned_employees: { startsWith: `${user_id},` } },
        { assigned_employees: { endsWith: `,${user_id}` } },
        { assigned_employees: user_id },
      ];
    }
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
    const orderBy = [
      { assigned_date: 'desc' },
      { created_at: 'desc' },
    ];
    const [total, records] = await Promise.all([
      prisma.contact_us_messages.count({ where }),
      prisma.contact_us_messages.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ]);
    return NextResponse.json({ success: true, data: records, total, page, pageSize });
  } catch (error) {
    console.error("GET /api/contactUs error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch messages", error }, { status: 500 });
  }
}

export async function POST(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const res = await prisma.contact_us_messages.create({
      data: {
        user_name: body.user_name,
        user_email: body.user_email,
        phone_number: body.phone_number,
        office_location: body.office_location,
        message: body.message,
        quality_status: body.quality_status || 'pending',
        choosable_status: body.choosable_status || 'false',
        assigned_employees: body.assigned_employees || null,
        assigned_date: body.assigned_date || null,
      }
    });
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: 'muhammad.bilal0729@gmail.com',
      subject: 'Contact Us Message Received',
      html: `<p>Contact from: ${body.user_name || 'Unknown'} (${body.user_email || 'N/A'})</p>`
    });
    return NextResponse.json({ success: true, data: res });
  } catch (error) {
    console.error("POST /api/contactUs error:", error);
    return NextResponse.json({ success: false, message: "Failed to create message", error }, { status: 500 });
  }
}
