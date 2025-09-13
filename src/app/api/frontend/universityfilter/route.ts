import slugify from 'slugify';
import pool from '../../../../lib/db/db';
import { RowDataPacket } from 'mysql2'
import { NextRequest } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const country = searchParams.get('country') || '';
    const scholarship = searchParams.get('scholarship') || '';
    const qualifications = searchParams.get('qualification') || '';

    console.log('🔍 University API called with params:', { page, limit, search, country, scholarship, qualifications });

    // Query to count total universities
    const [rows] = await pool.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM university_details");
    const totalUniversities = rows[0].total;

    if (totalUniversities === 0) {
      return Response.json({
        success: true,
        data: [],
        message: 'No universities found'
      });
    }

    // If ID is provided, return a single university
    if (id) {
      const [universityRows] = await pool.query<RowDataPacket[]>("SELECT * FROM university_details WHERE id = ?", [id]);
      if (universityRows.length === 0) {
        return Response.json({ error: 'University not found' }, { status: 404 });
      }

      const university = universityRows[0];
      // Convert BigInt fields to string
      university.phone_no = university.phone_no ? university.phone_no.toString() : null;
      university.agency_number = university.agency_number ? university.agency_number.toString() : null;

      return Response.json(university);
    }

    // If slug is provided, return university by slug
    if (slug) {

      const [universityRows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM university_details WHERE slug = ? AND display = true AND active = true",
        [slug]
      );
      if (universityRows.length === 0) {
        return Response.json({ error: 'University not found' }, { status: 404 });
      }
      const university = universityRows[0];
      // Convert BigInt fields to string
      university.phone_no = university.phone_no ? university.phone_no.toString() : null;
      university.agency_number = university.agency_number ? university.agency_number.toString() : null;

      return Response.json(university);
    }

    // Build where clause for filtering and pagination
    let whereClause = "WHERE display = true AND active = true";
    const queryParams: any[] = [];

    // Add search filter
    if (search) {
      whereClause += " AND (name LIKE ? OR country LIKE ? OR city LIKE ?)";
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add country filter
    if (country && country !== 'Select Country') {
      whereClause += " AND country LIKE ?";
      queryParams.push(`%${country}%`);
    }

    // Add scholarship filter
    if (scholarship && scholarship !== '') {
      if (scholarship === 'With Scholarship') {
        whereClause += " AND scholarship = true";
      } else if (scholarship === 'Without Scholarship') {
        whereClause += " AND scholarship = false";
      } else {
        whereClause += " AND scholarship = ?";
        queryParams.push(scholarship === 'true' || scholarship === '1');
      }
    }

    // Add qualifications filter
    if (qualifications && qualifications !== '') {
      const qualificationList = qualifications.split(',').map(q => q.trim());

      // Handle the case when there's more than one qualification
      if (qualificationList.length > 1) {
        // Find universities with matching qualifications for multiple qualifications
        const [qualificationRows] = await pool.query<RowDataPacket[]>(
          `SELECT DISTINCT university_id FROM courses WHERE qualification IN (?)`,
          [qualificationList]
        );

        if (qualificationRows.length === 0) {
          whereClause += " AND id IN (SELECT 0)";  // No results
        } else {
          const validUniversityIds = qualificationRows.map(row => row.university_id);
          console.log("Valid UniversityID", validUniversityIds);
          whereClause += " AND id IN (?)";
          queryParams.push(validUniversityIds);
        }
      } else {
        // Handle the case when there's just one qualification
        const [qualificationRows] = await pool.query<RowDataPacket[]>(
          `SELECT DISTINCT university_id FROM courses WHERE qualification LIKE ?`,
          [`%${qualificationList[0]}%`] // Using LIKE for a single qualification
        );

        if (qualificationRows.length === 0) {
          whereClause += " AND id IN (SELECT 0)";  // No results
        } else {
          const validUniversityIds = qualificationRows.map(row => row.university_id);
          console.log("Valid UniversityID", validUniversityIds);
          whereClause += " AND id IN (?)";
          queryParams.push(validUniversityIds);
        }
      }
    }

    console.log('🔍 Final WHERE clause:', whereClause);
    console.log('🔍 Query parameters:', queryParams);

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination (after all filters)
    const [countRows] = await pool.query(`SELECT COUNT(*) AS totalCount FROM university_details ${whereClause}`, queryParams);
    const totalCount = countRows[0].totalCount;

    const maxPages = Math.ceil(totalCount / limit);
    if (page > maxPages && maxPages > 0) {
      return Response.json({
        success: false,
        error: 'Page number exceeds available results',
        redirectTo: maxPages,
        totalPages: maxPages,
        totalItems: totalCount
      }, { status: 400 });
    }

    // Get paginated data with the necessary fields
    const [universityRows] = await pool.query<RowDataPacket[]>(
      `SELECT *
      FROM university_details ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...queryParams, limit, skip]
    );

    if (universityRows.length === 0) {
      return Response.json({
        success: true,
        data: [],
        message: 'No results found with current filters'
      });
    }

    // Process universities to convert BigInt to string
    const processedUniversities = universityRows.map(university => ({
      ...university,
      phone_no: university.phone_no ? university.phone_no.toString() : null,
      agency_number: university.agency_number ? university.agency_number.toString() : null
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const startItem = skip + 1;
    const endItem = Math.min(skip + processedUniversities.length, totalCount);

    return Response.json({
      success: true,
      data: processedUniversities,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        startItem,
        endItem
      }
    });

  } catch (error) {
    console.error('🔍 Error in database queries:', error);
    return Response.json({
      success: false,
      error: 'Database query failed',
      details: error.message
    }, { status: 500 });
  }
}