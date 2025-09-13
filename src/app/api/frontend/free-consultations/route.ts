import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { FreeConsultationSchemaSoft as Schema } from '../../../../validations/freeconsultation';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


// POST create new consultation
export async function POST(req) {
  try {
    const body = await req.json();

    const parsed = Schema.parse(body);

    const { name, email, phone_number, last_education, country, city, interested_country, apply_for } = parsed;

    /*const [ checkEmail ] = await pool.query<RowDataPacket[]>("SELECT * FROM free_consulations WHERE email = ?", [email])
    
    if(checkEmail.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }*/

    const [getcountry] = await pool.query<RowDataPacket[]>("SELECT * FROM countries_db WHERE id = ?", [country])
    const [getcity] = await pool.query<RowDataPacket[]>("SELECT * FROM cities_db WHERE id = ?", [city])

    if(getcountry.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Country not found' },
        { status: 404 }
      );
    }

    if(getcity.length === 0){
      return NextResponse.json(
        { success: false, message: 'City not found' },
        { status: 404 }
      );
    }

    const [new_consultation] = await pool.query<ResultSetHeader>("INSERT INTO free_consulations (name, email, phone_number, last_education, country, city, interested_country, apply_for) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [name, email, phone_number, last_education, getcountry[0].name, getcity[0].name, interested_country, apply_for]);

    if(new_consultation.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to create consultation' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Consultation created successfully' },
      { status: 200 }
    );

  } catch (err: any) {
    if (err?.issues) {
      // ZodError
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const key = (issue.path?.[0] as string) ?? '_';
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return NextResponse.json(
        { ok: false, errors: fieldErrors },
        { status: 400 }
      );
    }

    console.error("freeconsulation POST error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}