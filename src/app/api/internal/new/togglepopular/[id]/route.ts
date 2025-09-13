import { NextResponse } from "next/server";
import pool from "../../../../../../lib/db/db";
import { ResultSetHeader } from "mysql2";

export async function PUT(req, { params }) {
  const { id } = params;  // Extracting the `id` from the URL parameters

  try {
    const data = await req.json();  // Extract the data (popular) from the request body

    // Ensure that `popular` field is passed in the body
    if (typeof data.popular !== 'boolean') {
      return NextResponse.json({ success: false, message: "'popular' must be a boolean value" }, { status: 400 });
    }

    // Convert boolean to 1 for true and 0 for false to match your database storage format
    const popularValue = data.popular ? 1 : 0;

    // Build the SQL UPDATE query
    const query = `
      UPDATE courses
      SET popular = ?
      WHERE id = ?
    `;

    // Set the parameters for the query
    const params = [popularValue, id];

    // Execute the query using the pool
    const [result] = await pool.execute<ResultSetHeader>(query, params);

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Course not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Course popular status updated successfully" });
  } catch (error) {
    console.error('Error updating course popular status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
