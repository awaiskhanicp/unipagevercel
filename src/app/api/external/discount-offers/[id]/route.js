import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

function checkAuth(req) {
  const authHeader = req.headers.get('authorization');
  const token = process.env.API_SECRET_TOKEN;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== token) {
    return false;
  }
  return true;
}

// All possible fields for discountoffers, including follow-up/assignment/quality
const ALLOWED_FIELDS = [
  'name',
  'email',
  'phone',
  'lastEducation',
  'lastEducationPer',
  'city',
  'location',
  'emailSended',
  'smsSended',
  'assigned_employees',
  'first_followup',
  'first_followup_change_date',
  'second_followup',
  'second_followup_change_date',
  'third_followup',
  'third_followup_change_date',
  'choosable_status',
  'assigned_date',
  'first_date',
  'second_date',
  'third_date',
  'not_connected_status',
  'quality_status',
  'quality_comment',
  'quality_date'
];

export async function PUT(req, context) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { id } = await context.params;
    const body = await req.json();
    const record = await prisma.discountoffers.findUnique({ where: { id: parseInt(id) } });
    if (!record) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }
    const now = new Date();
    const updateData = {};
    for (const key of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        updateData[key] = body[key];
      }
    }
    // Track follow-up/assignment/quality changes
    if (
      Object.prototype.hasOwnProperty.call(body, 'first_followup') &&
      (record.first_followup !== body.first_followup)
    ) {
      updateData.first_followup_change_date = now;
      updateData.first_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'second_followup') &&
      (record.second_followup !== body.second_followup)
    ) {
      updateData.second_followup_change_date = now;
      updateData.second_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'third_followup') &&
      (record.third_followup !== body.third_followup)
    ) {
      updateData.third_followup_change_date = now;
      updateData.third_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'assigned_employees') &&
      (record.assigned_employees !== body.assigned_employees)
    ) {
      updateData.assigned_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'quality_status') &&
      (record.quality_status !== body.quality_status)
    ) {
      updateData.quality_date = now;
    }
    // Remove forbidden fields if present
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'No valid fields to update' }, { status: 400 });
    }
    const updated = await prisma.discountoffers.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/discount-offers/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Update failed', error: { name: error.name, message: error.message } }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const record = await prisma.discountoffers.findUnique({ where: { id: parseInt(id) } });
    if (!record) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }
    await prisma.discountoffers.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete', details: error.message }, { status: 500 });
  }
} 