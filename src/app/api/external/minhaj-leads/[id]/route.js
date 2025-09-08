import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

// GET: Get lead detail by ID
export async function GET(req, { params }) {
  const { id } = params;
  try {
    const record = await prisma.minhaj_university_leads.findUnique({ where: { id: Number(id) } });
    if (!record) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch lead' }, { status: 500 });
  }
}

// PUT: Update lead (with followup/assignment logic)
export async function PUT(req, { params }) {
  const { id } = params;
  try {
    const body = await req.json();
    const record = await prisma.minhaj_university_leads.findUnique({ where: { id: Number(id) } });
    if (!record) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    // Only update followup_change_date if note changes
    let updateData = { ...body };
    ['first_followup', 'second_followup', 'third_followup'].forEach((field, idx) => {
      const changeField = `${field}_change_date`;
      if (body[field] !== undefined && body[field] !== record[field]) {
        updateData[changeField] = new Date();
      } else {
        delete updateData[changeField];
      }
    });

    const updated = await prisma.minhaj_university_leads.update({
      where: { id: Number(id) },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update lead' }, { status: 500 });
  }
}

// DELETE: Remove a lead
export async function DELETE(req, { params }) {
  const { id } = params;
  try {
    await prisma.minhaj_university_leads.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete lead' }, { status: 500 });
  }
} 