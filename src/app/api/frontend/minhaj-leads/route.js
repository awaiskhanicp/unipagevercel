import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      full_name,
      roll_number,
      department,
      email,
      last_education,
      country,
      city,
      interested_country,
      apply_for,
      whatsapp_number,
    } = body;

    // Validate required fields
    if (!full_name || !email || !whatsapp_number) {
      return NextResponse.json(
        { success: false, message: 'Full name, email, and WhatsApp number are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.execute(
      `INSERT INTO minhaj_university_leads 
       (full_name, roll_number, department, email, last_education, country, city, interested_country, apply_for, whatsapp_number, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [full_name, roll_number, department, email, last_education, country, city, interested_country, apply_for, whatsapp_number]
    );

    return NextResponse.json({
      success: true,
      message: 'Lead created successfully',
      data: {
        id: result.insertId,
        full_name,
        roll_number,
        department,
        email,
        last_education,
        country,
        city,
        interested_country,
        apply_for,
        whatsapp_number
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create lead', error: error.message },
      { status: 500 }
    );
  }
}