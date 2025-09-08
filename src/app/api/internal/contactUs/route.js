import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma"; 
// Handle POST request - Create a new message
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      office_location,
      user_name,
      user_email,
      phone_number,
      message,
    } = body;

    const newMessage = await prisma.contact_us_messages.create({
      data: {
        office_location,
        user_name,
        user_email,
        phone_number,
        message,
      },
    });

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contactUs error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error", error }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const startTime = Date.now();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const office = searchParams.get('office') || '';
    
    console.log('🔍 ContactUs API Request:', { 
      page, 
      limit, 
      search, 
      startDate, 
      endDate, 
      office,
      url: request.url 
    });
    
    // Test the database connection first
    try {
      console.log('🔍 Testing database connection...');
      const testCount = await prisma.contact_us_messages.count();
      console.log('✅ Database connection successful. Total contact messages in database:', testCount);
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      throw new Error('Database connection failed');
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Build where clause for filtering
    let whereClause = {};
    
    // Search filter
    if (search) {
      const searchWords = search.split(/\s+/).filter(Boolean);
      if (searchWords.length > 0) {
        const searchClauses = searchWords.map(word => ({
          OR: [
            { user_name: { contains: word } },
            { user_email: { contains: word } },
            { phone_number: { contains: word } },
            { office_location: { contains: word } },
            { message: { contains: word } }
          ]
        }));
        
        whereClause.AND = (whereClause.AND || []).concat(searchClauses);
      }
    }
    
    // Date range filters
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at.gte = new Date(startDate + 'T00:00:00Z');
      }
      if (endDate) {
        whereClause.created_at.lte = new Date(endDate + 'T23:59:59Z');
      }
    }
    
    // Office filter
    if (office) {
      whereClause.office_location = { contains: office };
    }
    
    console.log('📋 Final where clause:', JSON.stringify(whereClause, null, 2));

    // If no filters are applied, just get basic pagination
    if (Object.keys(whereClause).length === 0) {
      console.log('🔍 No filters applied, using basic pagination');
      whereClause = {};
    }

    // Test the where clause with a simple query first
    try {
      console.log('🔍 Testing where clause with count query...');
      const testCountWithWhere = await prisma.contact_us_messages.count({ where: whereClause });
      console.log('✅ Where clause test successful. Count with filters:', testCountWithWhere);
    } catch (whereError) {
      console.error('❌ Where clause test failed:', whereError);
      console.error('❌ Where clause error details:', {
        name: whereError.name,
        message: whereError.message,
        code: whereError.code
      });
      throw new Error(`Where clause test failed: ${whereError.message}`);
    }

    const [totalItems, items] = await Promise.all([
      prisma.contact_us_messages.count({ where: whereClause }),
      prisma.contact_us_messages.findMany({ 
        where: whereClause,
        orderBy: { created_at: 'desc' }, 
        skip, 
        take: limit 
      })
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const responseData = {
      success: true,
      data: items,
      meta: { page, limit, totalItems, totalPages, startIndex: skip, endIndex: skip + items.length }
    };
    
    const responseTime = Date.now() - startTime;
    const responseSize = JSON.stringify(responseData).length;
    
    console.log('✅ ContactUs API Response:', {
      totalItems,
      itemsReturned: items.length,
      page,
      totalPages,
      responseTime: `${responseTime}ms`,
      responseSize: `${responseSize} bytes`,
      filtersApplied: {
        search: !!search,
        dateRange: !!(startDate || endDate),
        office: !!office
      }
    });
    
    return NextResponse.json(responseData);
  } catch (err) {
    console.error("❌ GET API Error:", err);
    console.error("❌ Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch contact messages",
      details: err.message 
    }, { status: 500 });
  }
}