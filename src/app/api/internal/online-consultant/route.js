import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// POST - Save online consultant application
export async function POST(req) {
  try {
    const body = await req.json();    
    const { 
      student_name, 
      student_email, 
      student_phone_number, 
      student_last_education, 
      student_country, 
      student_state, 
      student_city, 
      interested_country, 
      student_apply_for, 
      application_type 
    } = body;

    // Validate required fields
    if (!student_name || !student_phone_number || !student_last_education || !interested_country || !student_apply_for) {
      return NextResponse.json({ 
        success: false, 
        message: "Required fields are missing" 
      }, { status: 400 });
    }

    // Create new online consultant application
    const newApplication = await prisma.online_consultants.create({
      data: {
        application_type: application_type || 'online',
        student_name,
        student_email: student_email || null,
        student_phone_number,
        student_last_education,
        student_country: student_country || null,
        student_state: student_state || null,
        student_city: student_city || null,
        student_apply_for,
        interested_country,
        choosable_status: 'Pending',
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: newApplication,
      message: "Application submitted successfully!" 
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/internal/online-consultant error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error" 
    }, { status: 500 });
  }
}

// GET - Get all online consultant applications (for admin use)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const interestedCountry = searchParams.get('interested_country') || '';
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    console.log('🔍 Online Consultant API Request:', { 
      page, 
      limit, 
      search, 
      startDate, 
      endDate, 
      interestedCountry, 
      status 
    });

    // Build where clause for search and filters
    let whereClause = {};
    
    // Search functionality
    if (search && search.trim().length >= 2) {
      whereClause.OR = [
        { student_name: { contains: search } },
        { student_email: { contains: search } },
        { student_phone_number: { contains: search } },
        { student_last_education: { contains: search } },
        { student_country: { contains: search } },
        { student_state: { contains: search } },
        { student_city: { contains: search } },
        { student_apply_for: { contains: search } },
        { interested_country: { contains: search } }
      ];
    }

    // Date range filtering
    if (startDate || endDate) {
      whereClause.created_at = {};
      if (startDate) {
        whereClause.created_at.gte = new Date(startDate + 'T00:00:00Z');
      }
      if (endDate) {
        whereClause.created_at.lte = new Date(endDate + 'T23:59:59Z');
      }
    }

    // Country filtering
    if (interestedCountry) {
      whereClause.interested_country = interestedCountry;
    }

    // Status filtering
    if (status) {
      whereClause.choosable_status = status;
    }

    console.log('🔍 Where clause:', JSON.stringify(whereClause, null, 2));

    const [applications, totalItems] = await Promise.all([
      prisma.online_consultants.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.online_consultants.count({ where: whereClause })
    ]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    console.log('✅ Online Consultant API Response:', {
      totalItems,
      applicationsReturned: applications.length,
      page,
      totalPages,
      search,
      filtersApplied: {
        search: !!search,
        dateRange: !!(startDate || endDate),
        country: !!interestedCountry,
        status: !!status
      }
    });

    return NextResponse.json({
      success: true,
      data: applications,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        startIndex: skip,
        endIndex: skip + applications.length
      }
    });
  } catch (error) {
    console.error("❌ GET /api/internal/online-consultant error:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal Server Error",
      details: error.message 
    }, { status: 500 });
  }
}
