
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from "../../../../lib/db/db"

export async function POST(req: NextRequest) {
  try {
    
    const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT 
        c.id, 
        c.name, 
        c.popular, 
        c.qualification,
        u.name AS university
        FROM courses c
        LEFT JOIN university_details u ON c.university_id = u.id
        WHERE c.popular = 1 ORDER BY c.created_at DESC LIMIT 3`
    )

    console.log(rows)

    if(rows.length > 0)
    {
        return NextResponse.json(
            {
                success: true,
                data: rows
            },
            {
                status: 200
            }
        )
    }
    else{
        return NextResponse.json(
            {
                success: false,
                message: "No University Found"
            },
            {
                status: 200
            }
        )
    }

  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message
      },
      {
        status: 500
      }
    )
  }
}