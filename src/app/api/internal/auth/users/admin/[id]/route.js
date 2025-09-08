import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';

// GET single admin (optional - if you need it)
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const admin = await prisma.users.findUnique({
      where: { id: parseInt(resolvedParams.id) },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        user_type: true,
        created_at: true,
        metadata: true
      }
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        ...admin,
        created_at: admin.created_at.toISOString(),
        permissions: [] // No metadata field, so no permissions stored
      }
    });
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// UPDATE admin information and permissions
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    console.log('Admin update request body:', body);
    console.log('Admin ID from params:', resolvedParams.id, 'Type:', typeof resolvedParams.id);
    
    const {
      first_name,
      last_name,
      email,
      current_password,
      new_password,
      permissions,
      is_active
    } = body;

    // Check if this is a status-only update
    if (is_active !== undefined && Object.keys(body).length === 1) {
      console.log('Updating admin status only:', { id: resolvedParams.id, is_active });
      
      const updatedAdmin = await prisma.users.update({
        where: { id: parseInt(resolvedParams.id) },
        data: { is_active: Boolean(is_active) },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          user_type: true,
          is_active: true,
          created_at: true
        }
      });

      console.log('Admin status updated successfully:', updatedAdmin);

      return NextResponse.json({
        success: true,
        message: `Admin ${is_active ? 'activated' : 'deactivated'} successfully`,
        admin: {
          ...updatedAdmin,
          created_at: updatedAdmin.created_at.toISOString(),
          permissions: []
        }
      });
    }

    // Check if this is a permissions-only update
    if (permissions !== undefined && Object.keys(body).length === 1) {
      // Since metadata field doesn't exist, we'll store permissions in a different way
      // For now, just return success without updating permissions
      return NextResponse.json({
        success: true,
        message: 'Permissions update not implemented yet - metadata field does not exist',
        admin: {
          id: parseInt(resolvedParams.id),
          permissions: permissions || []
        }
      });
    }

    // Full admin update
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { success: false, message: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another user
    try {
      const existingUser = await prisma.users.findFirst({
        where: {
          email: email,
          id: { not: parseInt(resolvedParams.id) }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email is already taken by another user' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking email uniqueness:', error);
      return NextResponse.json(
        { success: false, message: 'Error checking email uniqueness' },
        { status: 500 }
      );
    }

    // Prepare update data
    const updateData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email.trim(),
      updated_at: new Date()
    };

    // Handle password change if provided
    if (new_password) {
      if (!current_password) {
        return NextResponse.json(
          { success: false, message: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Verify current password
      const currentAdmin = await prisma.users.findUnique({
        where: { id: parseInt(resolvedParams.id) },
        select: { password: true }
      });

      if (!currentAdmin) {
        return NextResponse.json(
          { success: false, message: 'Admin not found' },
          { status: 404 }
        );
      }

      const bcrypt = require('bcrypt');
      const isPasswordValid = await bcrypt.compare(current_password, currentAdmin.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(new_password, 10);
      updateData.password = hashedPassword;
    }

      // Update admin
          const updatedAdmin = await prisma.users.update({
      where: { id: parseInt(resolvedParams.id) },
        data: updateData,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          user_type: true,
          is_active: true,
          created_at: true
        }
      });

    console.log('Admin updated successfully:', { id: updatedAdmin.id, email: updatedAdmin.email });

    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
      admin: {
        ...updatedAdmin,
        created_at: updatedAdmin.created_at.toISOString(),
        permissions: [] // No metadata field, so no permissions stored
      }
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE admin
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    await prisma.users.delete({
      where: { id: parseInt(resolvedParams.id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}