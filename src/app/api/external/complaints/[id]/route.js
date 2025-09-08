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

export async function PUT(req, { params }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  try {
    const id = parseInt(params.id);
    if (!id) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    const body = await req.json();
    const record = await prisma.complaints.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }
    const now = new Date();
    const updateData = { ...body };
    // Track follow-up changes
    if (
      Object.prototype.hasOwnProperty.call(body, 'first_followup') &&
      (record.first_followup !== body.first_followup)
    ) {
      updateData.first_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'second_followup') &&
      (record.second_followup !== body.second_followup)
    ) {
      updateData.second_date = now;
    }
    if (
      Object.prototype.hasOwnProperty.call(body, 'third_followup') &&
      (record.third_followup !== body.third_followup)
    ) {
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
    const updated = await prisma.complaints.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/complaints/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Update failed', error: { name: error.name, message: error.message } }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const id = parseInt(params.id);
  if (!id) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  try {
    const record = await prisma.complaints.findUnique({ where: { id } });
    if (!record) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }
    await prisma.complaints.delete({ where: { id } });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete', details: error.message }, { status: 500 });
  }
}