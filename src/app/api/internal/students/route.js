import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || ''; // 'active' | 'inactive' | ''
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // First, let's check if the users table has any data at all
    const totalUsers = await prisma.users.count();
    console.log('Total users in database:', totalUsers);

    // First, let's check what user types exist in the database
    const userTypes = await prisma.users.findMany({
      select: { user_type: true },
      distinct: ['user_type']
    });
    
    console.log('Available user types:', userTypes);

    // Try different possible values for student
    let where = {
      OR: [
        { user_type: 'student' },
        { user_type: 'Student' },
        { user_type: 'STUDENT' },
        { user_type: 'students' }
      ]
    };

    // Add search functionality
    if (search) {
      const searchWords = search.split(/\s+/).filter(Boolean); // Split by whitespace and remove empty strings
      if (searchWords.length > 0) {
        const searchClauses = searchWords.map(word => ({
          OR: [
            { first_name: { contains: word } },
            { last_name: { contains: word } },
            { email: { contains: word } }
          ]
        }));
        
        where = {
          AND: [
            where,
            ...searchClauses
          ]
        };
      }
    }

    // Add status filter
    if (status) {
      where = {
        AND: [
          where,
          { is_active: status === 'active' ? true : false }
        ]
      };
    }

    // Add date range filters
    if (startDate || endDate) {
      where = {
        AND: [
          where,
          {
            created_at: {}
          }
        ]
      };
      
      if (startDate) {
        const start = new Date(startDate + 'T00:00:00Z');
        if (!isNaN(start)) {
          where.AND[where.AND.length - 1].created_at.gte = start;
        }
      }
      if (endDate) {
        const end = new Date(endDate + 'T23:59:59Z');
        if (!isNaN(end)) {
          where.AND[where.AND.length - 1].created_at.lte = end;
        }
      }
    }

    const [totalItems, users] = await Promise.all([
      prisma.users.count({ where }),
      prisma.users.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone: true,
          is_active: true,
          created_at: true,
          user_type: true, // Add this to see what we're actually getting
        },
      }),
    ]);

    console.log('Found users:', users.length, 'with total:', totalItems);

    const data = users.map((u) => ({
      id: u.id,
      name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
      email: u.email,
      phone: u.phone || '',
      is_active: u.is_active === null ? false : Boolean(u.is_active),
      lastEducation: '', // Removed problematic relation
      applyFor: '', // Removed problematic relation
      created_at: u.created_at,
      userType: u.user_type, // Add this for debugging
    }));

    console.log('Students API response:', { users, data, totalItems });

    const totalPages = Math.ceil(totalItems / limit);
    
    return NextResponse.json({ 
      success: true,
      data, 
      meta: { 
        totalItems, 
        totalPages, 
        currentPage: page, 
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      },
      debug: {
        totalUsersInDatabase: totalUsers,
        userTypes: userTypes.map(ut => ut.user_type),
        foundUsers: users.length
      }
    });
  } catch (error) {
    console.error('Students GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch students',
      message: error.message 
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, is_active } = body;

    if (id === undefined || is_active === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: id and is_active' 
      }, { status: 400 });
    }

    // Update the user's active status
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: { is_active: Boolean(is_active) },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        is_active: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Student ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Students PUT error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update student status',
      message: error.message 
    }, { status: 500 });
  }
}