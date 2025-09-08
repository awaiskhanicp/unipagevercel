import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  const id = parseInt(params.id);
  if (!id) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });

  try {
    await prisma.complaints.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}