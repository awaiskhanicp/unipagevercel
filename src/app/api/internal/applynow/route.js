import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// POST - Save application
export async function POST(req) {
  try {
    const body = await req.json();    
    const { name, city, state, country, email, phone_number, last_education, interested_country, apply_for, application_type } = body;

    const newApplication = await prisma.apply_now.create({
      data: {
        name,
        city,
        // persist extra fields if present
        // schema has: last_education, intrested_country, phone_number
        // Save provided variants/fallbacks
        intrested_country: interested_country || body.intrested_country || '',
        last_education,
        email,
        phone_number,
        // store additional meta in unused columns if you later add columns; for now ignore apply_for/country/state/application_type
      },
    });

    return NextResponse.json({ success: true, data: newApplication }, { status: 201 });
  } catch (error) {
    console.error("POST /api/applyNow error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// GET - Fetch all applications
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const pageParam = parseInt(searchParams.get('page') || '1');
    const limitParam = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    
    console.log('🔍 ApplyNow API called with params:', { page: pageParam, limit: limitParam, search });
    const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
    const limit = Number.isNaN(limitParam) || limitParam < 1 ? 15 : limitParam;
    const skip = (page - 1) * limit;

    // Debug: Check what's in the database when searching
    if (search && search.trim() !== '') {
      try {
        const sampleEntries = await prisma.apply_now.findMany({
          select: { id: true, name: true, city: true, phone_number: true },
          take: 5
        });
        console.log('🔍 Sample database entries:', sampleEntries);
        
        // Test a simple name search
        const testNameSearch = await prisma.apply_now.findMany({
          where: { name: { contains: 'Muhammad' } },
          select: { id: true, name: true },
          take: 3
        });
        console.log('🔍 Test search for "Muhammad":', testNameSearch);
      } catch (error) {
        console.log('🔍 Could not fetch sample entries:', error.message);
      }
    }

    // Build where clause for search
    let whereClause = {};
    if (search && search.trim() !== '') {
      const searchTerm = search.trim().toLowerCase();
      
      // Split search term into words for better matching
      const searchWords = searchTerm.split(' ').filter(word => word.length > 0);
      
      if (searchWords.length > 1) {
        // Multiple words - search for each word separately
        const wordConditions = searchWords.map(word => ({
          OR: [
            { name: { contains: word } },
            { city: { contains: word } },
            { phone_number: { contains: word } },
            { last_education: { contains: word } },
            { intrested_country: { contains: word } }
          ]
        }));
        
        whereClause = {
          AND: wordConditions
        };
      } else {
        // Single word - simple search
        whereClause = {
          OR: [
            { name: { contains: searchTerm } },
            { city: { contains: searchTerm } },
            { phone_number: { contains: searchTerm } },
            { last_education: { contains: searchTerm } },
            { intrested_country: { contains: searchTerm } }
          ]
        };
      }
      
      console.log('🔍 ApplyNow search where clause:', JSON.stringify(whereClause, null, 2));
      console.log('🔍 Search words:', searchWords);
    }

    const [totalItems, applications] = await Promise.all([
      prisma.apply_now.count({ where: whereClause }),
      prisma.apply_now.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      })
    ]);

    console.log('🔍 ApplyNow search results:', { 
      searchTerm: search, 
      totalCount: totalItems, 
      returnedCount: applications.length,
      whereClause 
    });

    // Debug: Show a few sample results to verify search is working
    if (search && applications.length > 0) {
      console.log('🔍 Sample search results:', applications.slice(0, 3).map(app => ({
        id: app.id,
        name: app.name,
        city: app.city,
        phone: app.phone_number
      })));
    }

    return NextResponse.json({ success: true, data: applications, meta: { page, limit, totalItems, totalPages: Math.max(1, Math.ceil(totalItems / limit)), startIndex: skip, endIndex: skip + applications.length } }, { status: 200 });
  } catch (error) {
    console.error("GET /api/applyNow error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}