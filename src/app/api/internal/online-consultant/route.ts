import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// GET - Fetch online consultant applications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const interestedCountry = searchParams.get('interested_country') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    let whereClauses: string[] = [];
    let values: any[] = [];

    if (search) {
      const word = `%${search}%`;
      whereClauses.push(`(student_name LIKE ? OR student_email LIKE ? OR student_phone_number LIKE ? OR student_last_education LIKE ? OR student_apply_for LIKE ? OR interested_country LIKE ?)`);
      values.push(word, word, word, word, word, word);
    }

    if (startDate) {
      whereClauses.push(`created_at >= ?`);
      values.push(`${startDate}T00:00:00Z`);
    }
    if (endDate) {
      whereClauses.push(`created_at <= ?`);
      values.push(`${endDate}T23:59:59Z`);
    }

    if (interestedCountry) {
      whereClauses.push(`interested_country = ?`);
      values.push(interestedCountry);
    }

    if (status) {
      whereClauses.push(`choosable_status = ?`);
      values.push(status);
    }

    const whereClauseString = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    const countQuery = `SELECT COUNT(*) as totalCount FROM online_consultants ${whereClauseString}`;
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, values);
    const totalCount = countResult[0].totalCount;

    const recordsQuery = `
      SELECT * FROM online_consultants
      ${whereClauseString}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    values.push(limit, skip);
    const [records] = await pool.execute<RowDataPacket[]>(recordsQuery, values);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: records,
      meta: {
        totalItems: totalCount,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("GET online_consultants error:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications', error: process.env.NODE_ENV === 'development' ? error.message : null },
      { status: 500 }
    );
  }
}
