import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request) {
  try {
    // Verify database connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('🔍 Course API - Database connection successful');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const qualification = searchParams.get('qualification') || '';
    const scholarship = searchParams.get('scholarship') || '';
    
    console.log('🔍 Course API called with params:', { page, limit, search, country, qualification, scholarship });

    // Build where clause for filtering
    const whereClause = {};
    const filters = [];

    // Search filter
    if (search && search.trim() !== '') {
      filters.push({
        OR: [
          { name: { contains: search.trim() } },
          { about: { contains: search.trim() } }
        ]
      });
    }

    // Scholarship filter
    if (scholarship && scholarship !== 'Select Scholarship') {
      console.log('🔍 Course API - Scholarship filter value:', scholarship);
      
      if (scholarship === 'With Scholarship') {
        filters.push({
          OR: [
            { scholarship: { contains: 'Yes' } },
            { scholarship: { contains: 'Available' } },
            { scholarship: { contains: 'True' } },
            { scholarship: { contains: '1' } },
            { scholarship: { contains: 'Scholarship' } }
          ]
        });
      } else if (scholarship === 'Without Scholarship') {
        filters.push({
          OR: [
            { scholarship: { contains: 'No' } },
            { scholarship: { contains: 'Not Available' } },
            { scholarship: { contains: 'False' } },
            { scholarship: { contains: '0' } },
            { scholarship: { contains: 'None' } }
          ]
        });
      } else {
        filters.push({ scholarship: { contains: scholarship } });
      }
    }

    // Qualification filter
    if (qualification && qualification !== '') {
      const qualificationList = qualification.split(',').map(q => q.trim()).filter(q => q);
      if (qualificationList.length > 0) {
        console.log('🔍 Course API - Qualification filter values:', qualificationList);
        
        const qualificationFilters = qualificationList.map(qual => ({
          qualification: { contains: qual }
        }));
        
        filters.push({ OR: qualificationFilters });
      }
    }

    // Country filter - handled separately as it requires university lookup
    let universityIdsForCountry = [];
    if (country && country !== 'Select Country') {
      console.log('🔍 Course API - Applying country filter for:', country);
      
      const matchingUniversities = await prisma.university_details.findMany({
        where: {
          country: { contains: country }
        },
        select: { id: true }
      });
      
      universityIdsForCountry = matchingUniversities.map(u => u.id);
      console.log('🔍 Course API - Universities matching country:', universityIdsForCountry.length);
      
      if (universityIdsForCountry.length === 0) {
        // No universities in this country, return empty results
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNextPage: false,
            hasPrevPage: false
          },
          filters: { country, qualification, scholarship, search },
          message: `No courses found for country: ${country}`
        });
      }
    }

    // Combine all filters
    if (filters.length > 0) {
      whereClause.AND = filters;
    }

    // Add country filter if applicable
    if (universityIdsForCountry.length > 0) {
      if (whereClause.AND) {
        whereClause.AND.push({ university_id: { in: universityIdsForCountry } });
      } else {
        whereClause.university_id = { in: universityIdsForCountry };
      }
    }

    console.log('🔍 Course API - Final where clause:', JSON.stringify(whereClause, null, 2));

    // Get total count with filters applied
    const totalCount = await prisma.courses.count({ where: whereClause });
    console.log('🔍 Course API - Total courses matching filters:', totalCount);

    if (totalCount === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false
        },
        filters: { country, qualification, scholarship, search },
        message: 'No courses found with current filters'
      });
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const totalPages = Math.ceil(totalCount / limit);
    
    if (page > totalPages && totalPages > 0) {
      return NextResponse.json({
        success: false,
        error: 'Page number exceeds available results',
        redirectTo: totalPages,
        totalPages,
        totalItems: totalCount
      }, { status: 400 });
    }

    // Fetch courses with pagination and filters
    const courses = await prisma.courses.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        yearly_fee: true,
        application_fee: true,
        duration_qty: true,
        duration_type: true,
        languages: true,
        starting_date: true,
        deadline: true,
        about: true,
        entry_requirments: true,
        curriculum: true,
        scholarship: true,
        active: true,
        display: true,
        popular: true,
        university_id: true,
        subject_id: true,
        qualification: true,
        created_at: true
      },
      skip,
      take: limit,
      orderBy: { created_at: 'desc' }
    });

    console.log('🔍 Course API - Courses fetched:', courses.length);

    // Enrich with university data
    const uniIds = [...new Set(courses.map(c => c.university_id).filter(Boolean))];
    const universities = uniIds.length > 0
      ? await prisma.university_details.findMany({
          where: { id: { in: uniIds } },
          select: { id: true, name: true, logo: true, city: true, country: true, alternate_email: true }
        })
      : [];
    const uniById = Object.fromEntries(universities.map(u => [u.id, u]));

    // Enrich with subject data
    const subjectIds = [...new Set(courses.map(c => c.subject_id).filter(Boolean))];
    const subjects = subjectIds.length > 0
      ? await prisma.subjects.findMany({
          where: { id: { in: subjectIds } },
          select: { id: true, name: true }
        })
      : [];
    const subjectById = Object.fromEntries(subjects.map(s => [s.id, s]));

    // Enrich courses with additional data
    const enriched = courses.map(course => {
      const university = uniById[course.university_id] || null;
      const subject = subjectById[course.subject_id] || null;
      
      return {
        ...course,
        university: university?.name || null,
        universityLogo: university?.logo || null,
        location: university ? [university.city, university.country].filter(Boolean).join(', ') : null,
        university_alternate_email: university?.alternate_email || null,
        university_name: university?.name || null,
        university_city: university?.city || null,
        university_country: university?.country || null,
        subject_name: subject?.name || null,
        qualification_name: course.qualification
      };
    });

    return NextResponse.json({
      success: true,
      data: enriched,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      filters: { country, qualification, scholarship, search }
    });
    
  } catch (error) {
    console.error('🔍 Course API - Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new course
export async function POST(req) {
  try {
    const data = await req.json();
    
    if (!data.name || !data.university_id || !data.subject_id) {
      return NextResponse.json(
        { success: false, message: "Missing required fields: name, university_id, subject_id" },
        { status: 400 }
      );
    }

    const newCourse = await prisma.courses.create({
      data: {
        name: data.name,
        university_id: data.university_id,
        subject_id: data.subject_id,
        sm_question: data.sm_question,
        sm_answer: data.sm_answer,
        review_detail: data.review_detail,
        rating_count: data.rating_count ?? 0,
        review_count: data.review_count ?? 0,
        avg_review_value: data.avg_review_value ?? 0.0,
        qualification: data.qualification,
        duration: data.duration,
        duration_qty: data.duration_qty,
        duration_type: data.duration_type,
        yearly_fee: data.yearly_fee,
        application_fee: data.application_fee,
        languages: data.languages,
        starting_date: data.starting_date ? new Date(data.starting_date) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        about: data.about,
        entry_requirments: data.entry_requirments,
        curriculum: data.curriculum,
        scholarship: data.scholarship,
        sort_order: data.sort_order ?? 0,
        active: data.active ?? true,
        display: data.display ?? true,
        popular: data.popular ?? false,
      },
    });

    return NextResponse.json({ success: true, data: newCourse });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}