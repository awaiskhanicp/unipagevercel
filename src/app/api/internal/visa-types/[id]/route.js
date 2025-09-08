import { NextResponse } from 'next/server';
import { prisma } from "../../../../../lib/prisma";

export async function DELETE(req, context) {
  const params = await context.params;
  try {
    const { id } = params;

    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, message: 'Valid visa type ID is required' },
        { status: 400 }
      );
    }

    await prisma.visa_types.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true, message: 'Visa type deleted' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete visa type' },
      { status: 500 }
    );
  }
}