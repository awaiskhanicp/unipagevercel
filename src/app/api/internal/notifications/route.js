import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';

// Test endpoint to manually create a notification
export async function PUT(request) {
  try {
    console.log('🧪 Testing notification creation...');
    
    // Test notification data
    const testNotification = {
      type: 'test',
      name: 'Test User',
      email: 'test@example.com',
      is_read: 0,
      meta: 'This is a test notification',
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    console.log('🧪 Creating test notification:', testNotification);
    
    const created = await prisma.notifications.create({
      data: testNotification,
    });
    
    console.log('✅ Test notification created:', created);
    
    // Verify it was created
    const count = await prisma.notifications.count();
    console.log('📊 Total notifications in database:', count);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test notification created successfully',
      notification: created,
      totalCount: count
    });
  } catch (error) {
    console.error('❌ Test notification creation failed:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Test failed',
      error: error.message 
    }, { status: 500 });
  }
}

// POST /api/internal/notifications
export async function POST(request) {
  try {
    const body = await request.json();
    const { role, id, name, email, event = 'login' } = body;

    if (!role || !id || !name || !email) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Simple message text
    let messageText = '';
    if (role === 'student') {
      messageText = 'New Student';
    } else if (role === 'consultant') {
      messageText = 'New Consultant';
    } else {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }

    const notificationData = {
      type: 'account',
      name,
      email,
      is_read: 0, // Use 0 for false (Int type in database)
      meta: messageText, // Save as plain string
      ...(role === 'student' ? { student_id: id } : { consultant_id: id }),
    };

    const notification = await prisma.notifications.create({
      data: notificationData,
    });

    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/internal/notifications
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    
    console.log('🔍 Notifications API Request:', { page, limit, search, type, status });
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    let whereClause = {};
    
    // Search filter
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { meta: { contains: search } }
      ];
    }
    
    // Type filter
    if (type) {
      whereClause.type = type;
    }
    
    // Status filter
    if (status !== '') {
      whereClause.is_read = parseInt(status);
    }
    
    console.log('🔍 Where clause:', whereClause);
    
    // Get total count and notifications
    const [totalItems, notifications] = await Promise.all([
      prisma.notifications.count({ where: whereClause }),
      prisma.notifications.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      })
    ]);
    
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    
    console.log('✅ Notifications fetched:', {
      totalItems,
      notificationsReturned: notifications.length,
      page,
      totalPages
    });
    
    return NextResponse.json({ 
      success: true, 
      data: notifications,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        startIndex: skip,
        endIndex: skip + notifications.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}