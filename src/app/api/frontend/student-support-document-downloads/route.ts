import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, documentId } = body;

    if (!name || !email || !phone || !documentId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO document_download_users (name, email, phone, document_id, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [name, email, phone, documentId]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'User saved successfully',
        user: {
          id: result.insertId,
          name,
          email,
          phone,
          document_id: documentId
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Save user error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save user', error: error.message },
      { status: 500 }
    );
  }
}
