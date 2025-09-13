// app/api/internal/university/route.js
import slugify from 'slugify';
import pool from '../../../../lib/db/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2'
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthentication } from '../../../utils/verifyAuthentication';

// Helper function to validate JSON fields
const validateJsonField = (field, fieldName) => {
  if (!field || field === '') return { valid: true, value: null };

  // If it's already an object (might happen if sent as FormData)
  if (typeof field === 'object') return { valid: true, value: field };

  try {
    const parsed = JSON.parse(field);
    return { valid: true, value: parsed };
  } catch (e) {
    console.log(`JSON validation failed for ${fieldName}:`, field, e.message);
    return {
      valid: false,
      error: `Invalid ${fieldName} format. Must be valid JSON. Received: ${field}`
    };
  }
};

// Custom JSON stringifier that handles BigInt
const safeJsonStringify = (obj) => {
  return JSON.stringify(obj, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value
  );
};

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("university-token")?.value || null;

    if (!token) {
      return NextResponse.json(
        {
          message: "Please Login to continue"
        },
        {
          status: 400
        }
      );
    }

    const decoded = await verifyAuthentication(token)

    if (decoded instanceof NextResponse) {
      return NextResponse.json(
        {
          message: "You are not authorized to do this action"
        },
        {
          status: 400
        }
      );
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData.entries());

    // Collect all validation errors
    const errors = [];
    if (typeof data.name === 'string' && !data.name.trim()) errors.push('University name is required');
    if (typeof data.country === 'string' && !data.country.trim()) errors.push('Country is required');

    // Validate JSON fields
    const reviewDetailValidation = validateJsonField(data.review_detail, 'review_detail');

    if (!reviewDetailValidation.valid) errors.push(reviewDetailValidation.error);

    // Validate ranking - must be a number if provided
    if (typeof data.ranking === 'string' && data.ranking.trim() !== '') {
      const rankingNum = parseFloat(data.ranking);
      if (isNaN(rankingNum)) {
        errors.push('Ranking must be a valid number');
      }
    }

    if (errors.length > 0) {
      return Response.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Generate slug (make sure data.name is a string)
    if (typeof data.name === 'string') {
      const slug = slugify(data.name, { lower: true, strict: true });

      // Check for existing university
      const [existingUniversityRows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM university_details WHERE slug = ? AND display = true LIMIT 1",
        [slug]
      );

      if (existingUniversityRows.length > 0) {
        return Response.json(
          { error: 'University with this name already exists' },
          { status: 400 }
        );
      }

     // Handle numeric fields
      const totalStudents = typeof data.total_students === 'string' ? parseInt(data.total_students) : null;
      const internationalStudent = typeof data.international_student === 'string' ? parseInt(data.international_student) : null;

      // Handle ranking - only set if valid and ensure it's a string before parsing
      const rankingValue = typeof data.ranking === 'string' && data.ranking.trim() !== ''
        ? parseFloat(data.ranking)
        : null;

        
      // Handle boolean fields
      const isPopular = data.popular === 'true';
      const hasScholarship = data.scholarship === 'true';

      // Handle phone number - remove all non-digit characters and convert to string
      const phoneNo = typeof data.phone_no === 'string' ? data.phone_no.replace(/\D/g, '') : null;

      // Handle image URLs
      const featureImage = data.feature_image_url || data.feature_image || null;
      const logo = data.logo_url || data.logo || null;

      // Create university
      const userId = decoded.id;

      const [result] = await pool.query<ResultSetHeader>(
        `INSERT INTO university_details 
          (name, slug, founded_in, country, city, address, postcode, phone_no, agency_number, total_students, 
          international_student, scholarship, about, guide, expanse, languages, accommodation, accommodation_detail, 
          intake, ranking, designation, alternate_email, website, popular, review_detail, 
          user_id, feature_image, logo) 
        VALUES 
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name, slug, data.founded_in || null, data.country || null, data.city || null, data.address || null,
          data.postcode || null, phoneNo ? BigInt(phoneNo) : null, data.agency_number || null, totalStudents,
          internationalStudent, hasScholarship, data.about || '', data.guide || '', data.expanse || '',
          data.languages || null, data.accommodation || '', data.accommodation_detail || '', data.intake || null,
          rankingValue, data.designation || null, data.alternate_email || null, data.website || null, isPopular,
          JSON.stringify(reviewDetailValidation.value), userId, featureImage, logo
        ]
      );

      // Get the inserted university
      const [universityRows] = await pool.query(
        "SELECT * FROM university_details WHERE id = ?",
        [result.insertId]
      );

      const university = universityRows[0];

      // Convert the university object to a plain object and handle BigInt
      const responseData = {
        ...university,
        phone_no: university.phone_no ? university.phone_no.toString() : null
      };

      return new Response(safeJsonStringify(responseData), {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return Response.json(
        { error: 'University name must be a string' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error creating university:', error);
    return Response.json(
      {
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Helper function to validate JSON fields
function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

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
      const qualificationList = qualifications.split(',').map(q => `%${q.trim()}%`);
      if (qualificationList.length > 0) {
        // Find universities with matching qualifications
        const [qualificationRows] = await pool.query<RowDataPacket[]>(
          `SELECT DISTINCT university_id FROM courses WHERE qualification LIKE ?`,
          [qualificationList]
        );
        if (qualificationRows.length === 0) {
          whereClause += " AND id IN (SELECT 0)";  // This will return no results
        } else {
          const validUniversityIds = qualificationRows.map(row => row.university_id);
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