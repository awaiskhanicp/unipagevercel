import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


// ================= GET Contact Messages with Filters =================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const office = searchParams.get('office') || '';

    const skip = (page - 1) * limit;

    let whereClauses: string[] = [];
    let values: any[] = [];

    // Search filter
    if (search) {
      const searchWords = search.split(/\s+/).filter(Boolean);
      if (searchWords.length > 0) {
        searchWords.forEach((word) => {
          whereClauses.push(
            `(user_name LIKE ? OR user_email LIKE ? OR phone_number LIKE ? OR office_location LIKE ? OR message LIKE ?)`
          );
          const val = `%${word}%`;
          values.push(val, val, val, val, val);
        });
      }
    }

    // Date filter
    if (startDate) {
      whereClauses.push(`created_at >= ?`);
      values.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      whereClauses.push(`created_at <= ?`);
      values.push(`${endDate} 23:59:59`);
    }

    // Office filter
    if (office) {
      whereClauses.push(`office_location LIKE ?`);
      values.push(`%${office}%`);
    }

    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Count query
    const [countRows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as totalCount FROM contact_us_messages ${whereClause}`,
      values
    );
    const totalCount = countRows[0].totalCount;

    // Records query
    const [records] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM contact_us_messages 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...values, limit, skip]
    );

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

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
    console.error("❌ GET /contactUs error:", error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contact messages' },
      { status: 500 }
    );
  }
}
