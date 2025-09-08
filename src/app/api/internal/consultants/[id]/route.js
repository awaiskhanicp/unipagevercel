import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { is_active, ...otherFields } = body;

    console.log('Consultant update request:', { id, body, is_active });

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing consultant ID' 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData = {};
    
    // Add is_active if provided
    if (is_active !== undefined) {
      updateData.is_active = Boolean(is_active);
    }

    // Add other fields if provided
    if (Object.keys(otherFields).length > 0) {
      Object.assign(updateData, otherFields);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No fields to update' 
      }, { status: 400 });
    }

    console.log('Updating consultant with data:', updateData);

    // Update the consultant
    const updatedConsultant = await prisma.users.update({
      where: { 
        id: parseInt(id),
        user_type: 'consultant' // Ensure we're only updating consultants
      },
      data: updateData,
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        is_active: true,
        user_type: true,
        created_at: true,
      }
    });

    console.log('Consultant updated successfully:', updatedConsultant);

    return NextResponse.json({ 
      success: true, 
      message: 'Consultant updated successfully',
      data: updatedConsultant
    });
  } catch (error) {
    console.error('Consultant update error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        error: 'Consultant not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update consultant',
      message: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing consultant ID' 
      }, { status: 400 });
    }

    // Delete the consultant
    await prisma.users.delete({
      where: { 
        id: parseInt(id),
        user_type: 'consultant' // Ensure we're only deleting consultants
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Consultant deleted successfully'
    });
  } catch (error) {
    console.error('Consultant delete error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        error: 'Consultant not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete consultant',
      message: error.message 
    }, { status: 500 });
  }
}