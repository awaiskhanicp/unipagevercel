import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
export async function PUT(req) {
  try {
    const data = await req.json();

    if (!data.id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }

    const updatedDetail = await prisma.visa_details.update({
      where: {
        id: parseInt(data.id)
      },
      data: {
        visa_title: data.visa_title,
        visa_description: data.visa_description,
        sm_question: data.sm_question,
        sm_answer: data.sm_answer,
        visa_image: data.visa_image,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedDetail
    });

  } catch (error) {
    console.error('Error updating visa detail:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update visa detail' },
      { status: 500 }
    );
  }
}

// DELETE - Remove visa detail
export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }

    await prisma.visa_details.delete({
      where: {
        id: parseInt(id)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Visa detail deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting visa detail:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete visa detail' },
      { status: 500 }
    );
  }
}