import pool from '../../../../lib/db/db';
import { NextResponse } from 'next/server';
import type { ResultSetHeader } from 'mysql2';

export async function POST(req: Request) {
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

    const [insertResult] = await pool.query<ResultSetHeader>(
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
  } catch (error: any) {
    console.error('DiscountOffers POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
