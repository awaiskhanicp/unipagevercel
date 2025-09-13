import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// ================= POST Create Contact Message =================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { office_location, user_name, user_email, phone_number, message } = body;

    if (!office_location || !user_name || !user_email || !phone_number || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO contact_us_messages 
        (office_location, user_name, user_email, phone_number, message) 
       VALUES (?, ?, ?, ?, ?)`,
      [office_location, user_name, user_email, phone_number, message]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to save contact message' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Message submitted successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST /contactUs error:", error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
