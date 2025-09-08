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

// Only fields that exist in the comment model
const ALLOWED_FIELDS = [
  'first_name',
  'last_name',
  'phone_number',
  'email',
  'comment',
  'article_id',
  'article_url',
  'type',
  'status',
  'first_followup',
  'second_followup',
  'third_followup',
  'first_date',
  'second_date',
  'third_date',
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
    const record = await prisma.comment.findUnique({ where: { comment_id: parseInt(id) } });
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
    // Track follow-up/quality changes
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
      Object.prototype.hasOwnProperty.call(body, 'quality_status') &&
      (record.quality_status !== body.quality_status)
    ) {
      updateData.quality_date = now;
    }
    // Remove forbidden fields if present
    delete updateData.comment_id;
    delete updateData.created_at;
    delete updateData.updated_at;
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'No valid fields to update' }, { status: 400 });
    }
    const updated = await prisma.comment.update({
      where: { comment_id: parseInt(id) },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PUT /api/comments/[id] error:', error);
    return NextResponse.json({ success: false, message: 'Update failed', error: { name: error.name, message: error.message } }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  if (!checkAuth(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  try {
    const record = await prisma.comment.findUnique({ where: { comment_id: parseInt(id) } });
    if (!record) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }
    await prisma.comment.delete({ where: { comment_id: parseInt(id) } });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete', details: error.message }, { status: 500 });
  }
}

// PATCH (update) comment status
export async function PATCH(request, { params }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: 'Invalid comment ID' }, { status: 400 });
  }

  try {
    const { status } = await request.json();

    if (!['approved', 'pending'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.comment.update({
      where: { comment_id: id },
      data: { status }
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH comment error:", error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}