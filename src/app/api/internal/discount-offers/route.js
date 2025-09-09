import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';

// -------------------------
// GET discount offers
// -------------------------
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const percentage = searchParams.get('percentage') || '';
    const location = searchParams.get('location') || '';

    const skip = (page - 1) * limit;

    let whereClauses = [];
    let values = [];

    // 🔍 Search by multiple fields
    if (search) {
      const searchWords = search.split(/\s+/).filter(Boolean);
      searchWords.forEach(word => {
        const wordValue = `%${word}%`;
        whereClauses.push(`(
          name LIKE ? OR 
          email LIKE ? OR 
          phone LIKE ? OR 
          city LIKE ? OR 
          location LIKE ? OR 
          lastEducationPer LIKE ?
        )`);
        values.push(...Array(6).fill(wordValue));
      });
    }

    // 📅 Date range filter
    if (startDate) {
      whereClauses.push(`created_at >= ?`);
      values.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      whereClauses.push(`created_at <= ?`);
      values.push(`${endDate} 23:59:59`);
    }

    // 🎓 Education filter
    if (percentage) {
      whereClauses.push(`lastEducationPer = ?`);
      values.push(percentage);
    }

    // 📍 Location filter
    if (location) {
      whereClauses.push(`location = ?`);
      values.push(location);
    }

    const whereClauseString =
      whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Count total
    const countQuery = `SELECT COUNT(*) as totalCount FROM discountoffers ${whereClauseString}`;
    const [countResult] = await pool.execute(countQuery, values);
    const totalCount = countResult[0].totalCount;

    // Fetch records
    const recordsQuery = `
      SELECT * FROM discountoffers
      ${whereClauseString}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    values.push(limit, skip);
    const [records] = await pool.execute(recordsQuery, values);

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
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('DiscountOffers GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch discount offers' },
      { status: 500 }
    );
  }
}

// -------------------------
// POST create new discount offer
// -------------------------
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      education,       // maps to lastEducation
      percentage,      // maps to lastEducationPer
      city,
      location,
      details          // maps to familyDetail
    } = body;

    const [insertResult] = await pool.query(
      `INSERT INTO discountoffers 
      (name, email, phone, lastEducation, lastEducationPer, city, location, familyDetail) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, education, percentage, city, location, details]
    );

    if (insertResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to create discount offer' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Discount offer created successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DiscountOffers POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

