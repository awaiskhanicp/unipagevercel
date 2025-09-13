import { NextRequest, NextResponse } from 'next/server';
import pool from "../../../../lib/db/db"
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function GET(request: NextRequest) {
  try {
    // Verify database pool
    await pool.execute('SELECT 1');
    console.log('🔍 Course API - Database pool successful');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const qualification = searchParams.get('qualification') || '';
    const scholarship = searchParams.get('scholarship') || '';
    const startdate = searchParams.get('start_date') || '';
    const enddate = searchParams.get('end_date') || '';
    const popular = searchParams.get('popular') || '';

    console.log('🔍 Course API called with params:', { page, limit, search, country, qualification, scholarship });

    // Build the SQL WHERE clause for filtering
    let whereClause = '1=1';
    let params = [];

    // Search filter
    if (search.trim() !== '') {
      whereClause += ` AND (name LIKE ? OR about LIKE ?)`;
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Scholarship filter
    if (scholarship && scholarship !== 'Select Scholarship') {
      if (scholarship === 'With Scholarship') {
        whereClause += ` AND (scholarship LIKE ? OR scholarship LIKE ? OR scholarship LIKE ? OR scholarship LIKE ? OR scholarship LIKE ?)`;
        params.push('%Yes%', '%Available%', '%True%', '%1%', '%Scholarship%');
      } else if (scholarship === 'Without Scholarship') {
        whereClause += ` AND (scholarship LIKE ? OR scholarship LIKE ? OR scholarship LIKE ? OR scholarship LIKE ? OR scholarship LIKE ?)`;
        params.push('%No%', '%Not Available%', '%False%', '%0%', '%None%');
      } else {
        whereClause += ` AND scholarship LIKE ?`;
        params.push(`%${scholarship}%`);
      }
    }

    // Qualification filter
    if (qualification && qualification !== '') {
      // Split qualification string by commas, trim spaces, and filter out empty values
      const qualificationList = qualification.split(',').map(q => q.trim()).filter(q => q);

      console.log("Check qualification split", qualificationList);

      if (qualificationList.length > 0) {
        // Handle single qualification case (if there is only one qualification)
        if (qualificationList.length === 1) {
          whereClause += ` AND qualification = ?`; // Use equality for exact match
          params.push(parseInt(qualificationList[0])); // Store the ID of the qualification
        } else {
          const qualificationFilters = qualificationList.map(() => `(qualification = ?)`).join(' OR ');
          whereClause += ` AND (${qualificationFilters})`;
          qualificationList.forEach(qual => params.push(parseInt(qual))); // Convert to integer IDs and add to params
        }
      }
    }

    // Date filters (startdate and enddate)
    if (startdate) {
      whereClause += ` AND starting_date >= ?`;
      params.push(new Date(startdate));
    }

    if (enddate) {
      whereClause += ` AND deadline <= ?`;
      params.push(new Date(enddate));
    }

    if (popular !== '') {
      whereClause += ` AND popular = ?`;
      params.push(popular === 'true' ? 1 : 0);
    }

    

    // Country filter - handled separately as it requires university lookup
    let universityIdsForCountry = [];
    if (country && country !== 'Select Country') {
      console.log('🔍 Course API - Applying country filter for:', country);
      
      const [matchingUniversities] = await pool.execute<RowDataPacket[]>(
        'SELECT id FROM university_details WHERE country LIKE ?',
        [`%${country}%`]
      );

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

    // Add country filter if applicable
    if (universityIdsForCountry.length > 0) {
      whereClause += ` AND university_id IN (?)`;
      params.push(universityIdsForCountry);
    }

    console.log('🔍 Course API - Final where clause:', whereClause);

    // Get total count with filters applied
    const [totalCountResult] = await pool.execute(
      `SELECT COUNT(*) AS count FROM courses WHERE ${whereClause}`,
      params
    );
    const totalCount = totalCountResult[0].count;

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
    const [courses] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        c.*,
        p.title AS qualification,
        p.id AS qualification_id
      FROM courses c
      LEFT JOIN posts p ON c.qualification = p.id
      WHERE ${whereClause} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, skip]
    );

    console.log('🔍 Course API - Courses fetched:', courses.length);

    // Enrich with university data
    const uniIds = [...new Set(courses.map(c => c.university_id).filter(Boolean))];
    // Generate a list of placeholders based on the number of university IDs
    const placeholders = uniIds.map(() => '?').join(', ');

    // Construct the query with dynamic placeholders
    const query = `
      SELECT id, name, logo, city, country, alternate_email 
      FROM university_details 
      WHERE id IN (${placeholders})`;

    // Execute the query with the university IDs as parameters
    const [universities] = uniIds.length > 0
      ? await pool.execute<RowDataPacket[]>(query, uniIds)
      : [];


    const uniById = Object.fromEntries(universities.map(u => [u.id, u]));

    // Enrich with subject data
    const subjectIds = [...new Set(courses.map(c => c.subject_id).filter(Boolean))];
    // Generate a list of placeholders for the number of subject IDs
    const subject_placeholders = subjectIds.map(() => '?').join(', ');

    // Construct the query with dynamic subject_placeholders
    const subject_query = `
      SELECT id, name 
      FROM subjects 
      WHERE id IN (${subject_placeholders})`;

    // Execute the subject_query with the subject IDs as parameters
    const [subjects] = subjectIds.length > 0
      ? await pool.execute<RowDataPacket[]>(subject_query, subjectIds)
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