// app/api/countries/route.ts
import { NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { RowDataPacket } from "mysql2";

export async function GET() {

  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, name FROM countries_db ORDER BY name ASC'
  );

  if(rows.length === 0)
  {
    return NextResponse.json(
      {
          message: "No countries found"
      },
      {
          status: 404
      }
    );
  }
  
  return NextResponse.json(
    {
        message: "Countries found",
        countries: rows
    },
    {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
    }
  );
}
