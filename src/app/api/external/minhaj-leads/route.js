import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

// GET: List leads with filtering and pagination
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search') || '';
    const quality_status = searchParams.get('quality_status');
    const choosable_status = searchParams.get('choosable_status');
    const user_id = searchParams.get('user_id');
    const user_ids = searchParams.get('user_ids');
    const interested_country = searchParams.get('interested_country');
    const assigned_start_date = searchParams.get('assigned_start_date');
    const assigned_end_date = searchParams.get('assigned_end_date');
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    // Build where clause
    const where = {};
    if (search) {
      where.OR = [
        { full_name: { contains: search } },
        { email: { contains: search } },
        { roll_number: { contains: search } },
        { city: { contains: search } },
      ];
    }
    if (quality_status) where.quality_status = quality_status;
    if (choosable_status) where.choosable_status = choosable_status;
    if (interested_country) where.interested_country = interested_country;
    if (user_id) where.shared_user_ids = { contains: user_id };
    if (user_ids) {
      const ids = user_ids.split(',');
      where.OR = [
        ...(where.OR || []),
        ...ids.map(id => ({ shared_user_ids: { contains: id } })),
      ];
    }
    // Date range filters
    if (assigned_start_date || assigned_end_date) {
      where.assigned_date = {};
      if (assigned_start_date) where.assigned_date.gte = new Date(assigned_start_date);
      if (assigned_end_date) where.assigned_date.lte = new Date(assigned_end_date);
    }
    if (from_date || to_date) {
      where.created_at = {};
      if (from_date) where.created_at.gte = new Date(from_date);
      if (to_date) where.created_at.lte = new Date(to_date);
    }
    const total = await prisma.minhaj_university_leads.count({ where });
    const data = await prisma.minhaj_university_leads.findMany({
      where,
      orderBy: [
        { assigned_date: 'desc' },
        { created_at: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return NextResponse.json({ success: true, data, total, page, pageSize });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch leads' }, { status: 500 });
  }
}

// POST: Create new lead (variable names match Laravel Request)
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      full_name,
      roll_number,
      department,
      email,
      last_education,
      country,
      city,
      interested_country,
      apply_for,
      whatsapp_number,
      // Optional fields
      choosable_status,
      shared_user_ids,
      assigned_date,
      quality_status,
      quality_comment,
      quality_date,
    } = body;
    const newLead = await prisma.minhaj_university_leads.create({
      data: {
        full_name,
        roll_number,
        department,
        email,
        last_education,
        country,
        city,
        interested_country,
        apply_for,
        whatsapp_number,
        choosable_status: choosable_status || null,
        shared_user_ids: shared_user_ids || null,
        assigned_date: assigned_date ? new Date(assigned_date) : null,
        quality_status: quality_status || null,
        quality_comment: quality_comment || null,
        quality_date: quality_date ? new Date(quality_date) : null,
      },
    });
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: 'muhammad.bilal0729@gmail.com',
      subject: 'Minhaj Lead Created',
      html: `<p>Lead from: ${body.full_name || 'Unknown'} (${body.email || 'N/A'})</p>`
    });
    return NextResponse.json({ success: true, data: newLead }, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ success: false, error: 'Failed to create lead' }, { status: 500 });
  }
}

// PATCH - Update follow-up, assignment, and status fields
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, ...updateFields } = body;
    if (!id) {
      return NextResponse.json({ success: false, message: 'ID is required for update' }, { status: 400 });
    }
    const record = await prisma.minhaj_university_leads.findUnique({ where: { id: parseInt(id) } });
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
    const updated = await prisma.minhaj_university_leads.update({
      where: { id: parseInt(id) },
      data: updateFields,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/minhaj-leads error:', error);
    return NextResponse.json({ success: false, message: 'Update failed', error }, { status: 500 });
  }
}