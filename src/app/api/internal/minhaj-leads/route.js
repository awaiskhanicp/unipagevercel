import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const departmentFilter = searchParams.get('department') || '';
    const countryFilter = searchParams.get('country') || '';

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    // Search filter
    if (search) {
      whereConditions.push('(full_name LIKE ? OR email LIKE ? OR roll_number LIKE ? OR whatsapp_number LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Date range filter
    if (startDate) {
      whereConditions.push('created_at >= ?');
      queryParams.push(startDate);
    }
    if (endDate) {
      whereConditions.push('created_at <= ?');
      queryParams.push(endDate + ' 23:59:59');
    }

    // Department filter
    if (departmentFilter) {
      whereConditions.push('department = ?');
      queryParams.push(departmentFilter);
    }

    // Country filter
    if (countryFilter) {
      whereConditions.push('country = ?');
      queryParams.push(countryFilter);
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Get total count
    const [countResult] = await pool.execute(
      `SELECT COUNT(*) as total FROM minhaj_university_leads ${whereClause}`,
      queryParams
    );

    const totalCount = countResult[0].total;

    // Get leads with pagination
    const [leads] = await pool.execute(
      `SELECT * FROM minhaj_university_leads 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: leads,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch leads', error: error.message },
      { status: 500 }
    );
  }
}