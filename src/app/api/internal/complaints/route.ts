import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// GET all complaints with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    const skip = (page - 1) * limit;

    let whereClauses: string[] = [];
    let values: any[] = [];

    // Search filter
    if (search && search.trim().length >= 2) {
      const likeValue = `%${search}%`;
      whereClauses.push(
        `(name LIKE ? OR email LIKE ? OR phone LIKE ? OR subject LIKE ? OR message LIKE ?)`
      );
      values.push(likeValue, likeValue, likeValue, likeValue, likeValue);
    }

    // Location filter
    if (location) {
      whereClauses.push(`location = ?`);
      values.push(location);
    }

    // Date range filter
    if (startDate) {
      whereClauses.push(`DATE(created_at) >= ?`);
      values.push(startDate);
    }

    if (endDate) {
      whereClauses.push(`DATE(created_at) <= ?`);
      values.push(endDate);
    }

    const whereClauseString = whereClauses.length > 0 ? "WHERE " + whereClauses.join(" AND ") : "";

    // Count total items
    const countQuery = `SELECT COUNT(*) as totalCount FROM complaints ${whereClauseString}`;
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, values);
    const totalItems = countResult[0].totalCount;

    // Get records with pagination
    const recordsQuery = `
      SELECT id, name, email, phone, location, subject, message, is_read, created_at, updated_at
      FROM complaints
      ${whereClauseString}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [complaints] = await pool.execute<RowDataPacket[]>(recordsQuery, [...values, limit, skip]);

    const totalPages = Math.max(1, Math.ceil(totalItems / limit));

    return NextResponse.json({
      success: true,
      data: complaints,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        startIndex: skip,
        endIndex: skip + complaints.length,
      },
    });
  } catch (error: any) {
    console.error("❌ GET /complaints error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}