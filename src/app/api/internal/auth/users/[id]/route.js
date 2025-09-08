// app/api/internal/auth/users/[id]/route.js
import { prisma } from '../../../../../../lib/prisma';
import { auth } from '../../../../../../auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    // Get ID from route params
    const userId = parseInt(params?.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (parseInt(session.user.id) !== userId) {
      return NextResponse.json(
        { message: 'Forbidden - You can only view your own profile' },
        { status: 403 }
      );
    }

    // Get user data
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
        user_type: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Get student data if user is a student
    let student = null;
    if (user.user_type === 'student') {
      student = await prisma.students.findFirst({
        where: { user_id: userId },
        select: {
          id: true,
          nationality: true,
          city: true,
          gender: true,
          prefered_program: true,
        }
      });
    }

    return NextResponse.json({
      user,
      student
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    // Get ID from route params
    const userId = parseInt(params?.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (parseInt(session.user.id) !== userId) {
      return NextResponse.json(
        { message: 'Forbidden - You can only update your own profile' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        { message: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // First get the student ID associated with this user
    let student = await prisma.students.findFirst({
      where: { user_id: userId }
    });
    
    // If no student record exists, create one instead of failing
    if (!student) {
      student = await prisma.students.create({
        data: {
          user_id: userId,
          name: `${body.first_name} ${body.last_name}`.trim(),
          city: body.city || '',
          nationality: body.nationality || '',
          gender: body.gender || null,
          prefered_program: body.program_type || '',
        }
      });
    }

    // Update user record
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone || null,
      },
    });

    // Update student record using the student's ID
    const updatedStudent = await prisma.students.update({
      where: { id: student.id },
      data: {
        name: `${body.first_name} ${body.last_name}`,
        nationality: body.nationality || '',
        city: body.city || '',
        gender: body.gender || null,
        prefered_program: body.program_type || '',
      },
    });

    return NextResponse.json({
      user: updatedUser,
      student: updatedStudent
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating student profile:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}