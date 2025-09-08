import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';



export async function DELETE(request, { params }) {
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ success: false, error: 'Invalid comment ID' }, { status: 400 });
  }

  try {
    // First delete all replies for this comment
    await prisma.replies.deleteMany({
      where: { parent_comment_id: id }
    });

    // Then delete the comment itself
    await prisma.comment.delete({
      where: { comment_id: id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE comment error:", error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
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

    if (!['1', '0'].includes(status)) {
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