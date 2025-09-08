import { prisma } from '../../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { is_active, ...otherFields } = body;

    console.log('Student update request:', { id, body, is_active });

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing student ID' 
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

    console.log('Updating student with data:', updateData);

    // Update the student
    const updatedStudent = await prisma.users.update({
      where: { 
        id: parseInt(id),
        user_type: { in: ['student', 'Student', 'STUDENT', 'students'] } // Ensure we're only updating students
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

    console.log('Student updated successfully:', updatedStudent);

    return NextResponse.json({ 
      success: true, 
      message: 'Student updated successfully',
      data: updatedStudent
    });
  } catch (error) {
    console.error('Student update error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        error: 'Student not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update student',
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
        error: 'Missing student ID' 
      }, { status: 400 });
    }

    // Delete the student
    await prisma.users.delete({
      where: { 
        id: parseInt(id),
        user_type: { in: ['student', 'Student', 'STUDENT', 'students'] } // Ensure we're only deleting students
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Student delete error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        error: 'Student not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete student',
      message: error.message 
    }, { status: 500 });
  }
}