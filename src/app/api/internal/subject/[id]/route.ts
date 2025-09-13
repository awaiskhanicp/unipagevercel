// /app/api/internal/subjects/[id]/route.js
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db/db";
import { ResultSetHeader } from "mysql2";

// ✅ GET single subject
/*export async function GET(req : NextRequest, { params }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const subject = await prisma.subjects.findUnique({ where: { id } });
    if (!subject) return NextResponse.json({ error: "Not Found" }, { status: 404 });
    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}*/

// ✅ PUT update subject
export async function PUT(req: NextRequest, { params }) {

  const {id} = await params;

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 }); // If ID is invalid, return 400 error
  }

  try {
    const body = await req.json(); // Parse the JSON body of the request

    // Construct the SQL query to update the subject based on the provided ID
    const query = `
      UPDATE subjects
      SET name = ?
      WHERE id = ?;
    `;

    // Use mysql2's 'execute' method to run the query, passing in the values
    const [result] = await pool.execute<ResultSetHeader>(query, [
      body.name,     // Name to update
      id             // ID to match the subject to update
    ]);

    // Check if any rows were updated
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Return the updated subject
    return NextResponse.json({
      success: true,
      data: {
        id,
        name: body.name,
      },
    });
  } catch (error) {
    console.error("PUT Error:", error); // Log the error
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// ✅ DELETE subject
export async function DELETE(req: NextRequest, { params }) {


  const {id} = await params;

  // Check if ID is valid
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  try {
    // Construct the SQL query to delete the subject by ID
    const query = 'DELETE FROM subjects WHERE id = ?';

    // Use mysql2's 'execute' method to run the query, passing in the ID
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);

    // Check if any rows were affected (deleted)
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    // Return a success message
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error('DELETE Error:', error); // Log the error
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}