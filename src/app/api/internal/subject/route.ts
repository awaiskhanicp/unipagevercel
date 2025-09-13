
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db/db";
import { ResultSetHeader } from "mysql2";

export async function GET(request: NextRequest){
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
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS count
         FROM subjects
         ${whereSql}`,
      whereParams
    );
    const totalCount = countRows[0]?.count ?? 0;

    // Page data
    const [subjects] = await pool.execute(
      `SELECT id, name
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

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json(); // Extract the data from the request body

    // Check if the 'name' field is provided, else return a 400 error
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required" 
      }, { status: 400 });
    }

    // Construct the SQL query to insert the new subject
    const query = `
      INSERT INTO subjects (name)
      VALUES (?);`;

    // Use mysql2's 'execute' method to run the query, passing in the values
    const [result] = await pool.execute<ResultSetHeader>(query, [name]); // Handle null for 'icon' if not provided

    // Return a success response with the inserted data
    return NextResponse.json({
      success: true,
      data: {
        id: result.insertId, // Inserted record's ID
        name,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ 
      error: "Failed to create subject",
      details: error.message 
    }, { status: 500 });
  }
}