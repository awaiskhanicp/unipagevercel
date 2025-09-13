import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


// POST create complaint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, subject, email, phone, message, location } = body;

    // Validation
    if (!email || !message) {
      return NextResponse.json(
        { success: false, error: "Email and message are required" },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO complaints (name, subject, email, phone, message, location)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query<ResultSetHeader>(insertQuery, [
      name,
      subject,
      email,
      phone || null,
      message,
      location || null,
    ]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Failed to create complaint" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Complaint created successfully", id: result.insertId },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /complaints error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}