import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const documentId = searchParams.get('documentId') || '';

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    // Search filter
    if (search) {
      whereConditions.push('(du.name LIKE ? OR du.email LIKE ? OR du.phone LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Date range filter (use du.created_at explicitly)
    if (startDate) {
      whereConditions.push('du.created_at >= ?');
      queryParams.push(startDate);
    }
    if (endDate) {
      whereConditions.push('du.created_at <= ?');
      queryParams.push(endDate + ' 23:59:59');
    }

    // Document filter
    if (documentId) {
      whereConditions.push('du.document_id = ?');
      queryParams.push(documentId);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM document_download_users du ${whereClause}`,
      queryParams
    );

    const totalCount = countResult[0].total;

    // Get users with pagination
    const [users] = await pool.execute(
      `SELECT 
        du.*,
        ds.file_name as document_name
       FROM document_download_users du
       LEFT JOIN student_support_documents ds ON du.document_id = ds.id
       ${whereClause}
       ORDER BY du.created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: users,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Document download users API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch download users', error: error.message },
      { status: 500 }
    );
  }
}
