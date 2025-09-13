
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from "../../../../../lib/db/db";


export async function POST() {
  try {

    
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id, name FROM university_details")

    if(rows.length > 0)
    {
        const universityDetails = rows;

        return NextResponse.json(
            {
                success: true,
                data: universityDetails
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
                message: "Unable to fetch University Details",
                data: []
            },
            {
                status: 404
            }
        )
    }

  } catch (err: any) {

    console.log(err)
    return NextResponse.json(
      {
        success: false,
        message: err.message,
      },
      {
        status: 500,
      }
    );
  }
}