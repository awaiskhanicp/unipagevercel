import { prisma } from "../../../../lib/prisma";


export async function POST(req) {
  try {
    const body = await req.json();
    console.log('🔍 Visit Visa API - Received data:', body);

    // Map gender to Prisma enum value
    const genderMap = {
      male: "Male",
      female: "Female",
      other: "Other"
    };

    const newVisa = await prisma.visit_visas.create({
      data: {
        name: body.givenName || '',
        email: body.email || '',
        phone: body.mobile || '',
        last_education: body.education || null,
        gender: genderMap[body.gender?.toLowerCase()] || null,
        taxpayer_type: body.taxpayer || null,
        bank_statment: body.bankStatement || null,
        country: body.homeCountry || null,
        state: body.state || null,
        city: body.city || null,
        country_name: body.applyFor || null,
        choosable_status: 'Pending',
        created_at: new Date(),
      },
    });

    console.log('✅ Visit Visa created successfully:', newVisa);
    return Response.json({ success: true, visa: newVisa });
  } catch (error) {
    console.error('Error creating visit visa:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Duplicate entry',
          details: 'A visa application with this email already exists'
        }),
        { status: 400 }
      );
    }
    
    if (error.code === 'P2000') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Validation error',
          details: 'One or more fields contain invalid data'
        }),
        { status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal Server Error',
        details: error.message 
      }),
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;
    
    // Build where clause for search
    let whereClause = {};
    if (search && search.trim() !== '') {
      whereClause = {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
          { country: { contains: search } },
          { country_name: { contains: search } }
        ]
      };
    }
    
    // Get total count for pagination
    const total = await prisma.visit_visas.count({ where: whereClause });
    
    // Get paginated results
    const visas = await prisma.visit_visas.findMany({
      where: whereClause,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return Response.json({ 
      success: true, 
      data: visas,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching visit visas:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P1001') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Database connection failed',
          details: 'Cannot connect to database server'
        }),
        { status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal Server Error',
        details: error.message 
      }),
      { status: 500 }
    );
  }
}