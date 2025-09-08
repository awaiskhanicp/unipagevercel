import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || '5', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || ''; // 'active' | 'inactive' | ''
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 5 : limitParam;
    const skip = (page - 1) * limit;

    // Find users with role 'consultant'
    let where = { user_type: 'consultant' };

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
          user_type: true,
          is_active: true,
          created_at: true,
          // Removed consultant relation to avoid database issues
        }
      })
    ]);

    const data = users.map(u => ({
      id: u.id,
      name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.email,
      email: u.email,
      mobile: u.phone || '',
      is_active: u.is_active === null ? false : Boolean(u.is_active),
      nationality: '', // Will be empty for now to avoid relation issues
      created_at: u.created_at,
    }));

    console.log('Consultants API response:', { users, data, totalItems });

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    return NextResponse.json({ 
      success: true,
      data, 
      meta: { 
        page, 
        limit, 
        totalItems, 
        totalPages, 
        startIndex: skip, 
        endIndex: skip + data.length 
      } 
    });
  } catch (error) {
    console.error('Consultants GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch consultants',
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
      message: `Consultant ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser
    });
  } catch (error) {
    console.error('Consultants PUT error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update consultant status',
      message: error.message 
    }, { status: 500 });
  }
}