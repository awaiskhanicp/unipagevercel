import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '15');
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 15 : limitParam;
    const skip = (page - 1) * limit;

    // Let's check what user types exist in the database
    console.log('Searching for users with user_type:', 'admin');
    
    // First, let's see all user types in the database
    const allUserTypes = await prisma.users.findMany({
      select: { user_type: true },
      distinct: ['user_type']
    });
    console.log('All user types in database:', allUserTypes);
    
    const where = { user_type: 'admin' };

    const [totalItems, admins] = await Promise.all([
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
          user_type: true,
          is_active: true,
          created_at: true,
        },
      }),
    ]);
    
    console.log('Database query results:', { totalItems, adminsCount: admins.length, where });

    const users = admins.map((u) => ({
      ...u,
      createdAt: u.created_at ? new Date(u.created_at).toISOString() : null,
      created_at: u.created_at ? new Date(u.created_at).toISOString() : null,
    }));

    console.log('Admin API response:', { admins, users, totalItems });

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    return NextResponse.json({
      success: true,
      users,
      meta: { page, limit, totalItems, totalPages, startIndex: skip, endIndex: skip + users.length },
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}