import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
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
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { city: { contains: search } },
        { location: { contains: search } },
      ];
    }
    if (quality_status) where.quality_status = quality_status;
    if (choosable_status) where.choosable_status = choosable_status;
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
      prisma.discountoffers.count({ where }),
      prisma.discountoffers.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      })
    ]);
    return NextResponse.json({ success: true, data: records, total, page, pageSize });
  } catch (error) {
    console.error('Error fetching discount offers:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch discount offers', error }, { status: 500 });
  }
}

export async function POST(request) {
  if (!checkAuth(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }
    const newOffer = await prisma.discountoffers.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        lastEducation: body.education || null,
        lastEducationPer: body.percentage ? parseFloat(body.percentage) : null,
        city: body.city || null,
        location: body.location || null,
        emailSended: false,
        smsSended: false,
      }
    });
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: 'muhammad.bilal0729@gmail.com',
      subject: 'Discount Offer Created',
      html: `<p>A new discount offer was created.</p>`
    });
    return NextResponse.json(
      { success: true, data: newOffer },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating discount offer:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create discount offer', error },
      { status: 500 }
    );
  }
}

// PATCH - Update follow-up, assignment, and status fields
export async function PATCH(req) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { id, ...updateFields } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required for update' }, { status: 400 });
    }
    const record = await prisma.discountoffers.findUnique({ where: { id: parseInt(id) } });
    if (!record) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }
    const now = new Date();
    if (
      Object.prototype.hasOwnProperty.call(updateFields, 'first_followup') &&
      (record.first_followup !== updateFields.first_followup)
    ) {
      updateFields.first_followup_change_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(updateFields, 'second_followup') &&
      (record.second_followup !== updateFields.second_followup)
    ) {
      updateFields.second_followup_change_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(updateFields, 'third_followup') &&
      (record.third_followup !== updateFields.third_followup)
    ) {
      updateFields.third_followup_change_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(updateFields, 'assigned_employees') &&
      (record.assigned_employees !== updateFields.assigned_employees)
    ) {
      updateFields.assigned_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(updateFields, 'quality_status') &&
      (record.quality_status !== updateFields.quality_status)
    ) {
      updateFields.quality_date = now;
    }
    const updated = await prisma.discountoffers.update({
      where: { id: parseInt(id) },
      data: updateFields,
    });
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: 'muhammad.bilal0729@gmail.com',
      subject: 'Discount Offer Updated',
      html: `<p>A discount offer was updated.</p>`
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/discount-offers error:', error);
    return NextResponse.json({ success: false, message: 'Update failed', error }, { status: 500 });
  }
}