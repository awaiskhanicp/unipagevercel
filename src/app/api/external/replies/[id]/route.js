import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// DELETE /api/replies/[id]
export async function DELETE(request, { params }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: 'Invalid reply ID' }, { status: 400 });
  }

  try {
    await prisma.replies.delete({
      where: { reply_id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE reply error:", error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}

// PATCH /api/replies/[id]
export async function PATCH(request, { params }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: 'Invalid reply ID' }, { status: 400 });
  }

  try {
    const { status } = await request.json();

    if (!['approved', 'pending'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.replies.update({
      where: { reply_id: id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH reply error:", error);
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}