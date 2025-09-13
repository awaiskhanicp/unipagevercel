import { RowDataPacket } from "mysql2";
import pool from "../../../../lib/db/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') || '';
    const active = searchParams.get('active') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    console.log('🔍 Guides API called with params:', { page, limit, search, featured, active, startDate, endDate });

    // Build WHERE clause for filtering
    let whereClauses = [];
    let queryParams = [];

    // Add search filter
    if (search) {
      whereClauses.push(`
        (title LIKE ? OR sub_title LIKE ? OR guide_type LIKE ?)
      `);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add featured filter
    if (featured !== '') {
      whereClauses.push('is_featured = ?');
      queryParams.push(featured === 'true' ? 1 : 0);
    }

    // Add active filter
    if (active !== '') {
      whereClauses.push('is_active = ?');
      queryParams.push(active === 'true' ? 1 : 0);
    }

    // Add date filters
    if (startDate) {
      whereClauses.push('created_at >= ?');
      queryParams.push(new Date(startDate).toISOString().slice(0, 19).replace('T', ' ')); // Format to 'YYYY-MM-DD HH:MM:SS'
    }
    if (endDate) {
      whereClauses.push('created_at <= ?');
      queryParams.push(new Date(endDate).toISOString().slice(0, 19).replace('T', ' ')); // Format to 'YYYY-MM-DD HH:MM:SS'
    }

    // Combine where clauses
    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) AS totalItems FROM guides ${whereClause}`;
    const [countResults] = await pool.query<RowDataPacket[]>(countQuery, queryParams);
    const totalItems = countResults[0].totalItems;
    const totalPages = Math.ceil(totalItems / limit);

    console.log('🔍 Total guides in database:', totalItems);
    console.log('🔍 Total pages:', totalPages);

    // Calculate pagination (OFFSET)
    const offset = (page - 1) * limit;

    // Fetch guides with pagination
    const guidesQuery = `
      SELECT id, title, sub_title, description, image, guide_type, university_id, subject_id, slug, sort_order, 
             is_active, is_featured, sm_question, sm_answer, review_detail, seo, created_at, updated_at
      FROM guides
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?;
    `;
    const [guides] = await pool.query<RowDataPacket[]>(guidesQuery, [...queryParams, limit, offset]);

    console.log('🔍 Fetched guides count:', guides.length);

    return Response.json({
      success: true,
      data: guides,
      meta: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('🔍 Error in guides API:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch guides',
      details: error.message
    }, { status: 500 });
  }
}
