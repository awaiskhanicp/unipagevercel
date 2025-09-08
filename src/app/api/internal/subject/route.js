
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get("page") || "1", 10) || 1;
    const limit = Number.parseInt(searchParams.get("limit") || "15", 10) || 15;
    const search = (searchParams.get("search") || "").trim();
    const skip = (page - 1) * limit;

    // WHERE + params for safe, index-friendly filtering
    let whereSql = "";
    const whereParams = [];
    if (search) {
      // Most MySQL collations are case-insensitive, so LIKE is fine
      whereSql = "WHERE name LIKE ?";
      whereParams.push(`%${search}%`);
    }

    // Count
    const [countRows] = await pool.execute<[{ count: number }]>(
      `SELECT COUNT(*) AS count
         FROM subjects
         ${whereSql}`,
      whereParams
    );
    const totalCount = countRows[0]?.count ?? 0;

    // Page data
    const [subjects] = await pool.execute<Array<{ id, name, icon }>>(
      `SELECT id, name, icon
         FROM subjects
         ${whereSql}
         ORDER BY name ASC
         LIMIT ? OFFSET ?`,
      [...whereParams, limit, skip]
    );

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        data: subjects,
        meta: {
          totalItems: totalCount,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      {
        status: 200,
        headers: {
          // optional: cache list responses for 1 hour
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  } catch (error) {
    console.error("GET /subjects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { name, icon } = await req.json();
    
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required" 
      }, { status: 400 });
    }

    // Use the correct model name
    const newSubject = await prisma.subjects.create({
      data: {
        name,
        icon: icon || null, // Handle null icon case
      },
    });
    
    return NextResponse.json({
      success: true,
      data: newSubject
    }, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ 
      error: "Failed to create subject",
      details: error.message 
    }, { status: 500 });
  }
}