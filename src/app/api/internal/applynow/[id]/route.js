import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
  const { id } = params;

  try {
    await prisma.apply_now.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json({ success: false, error: "Delete failed" }, { status: 500 });
  }
}