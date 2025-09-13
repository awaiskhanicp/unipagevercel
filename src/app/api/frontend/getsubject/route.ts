
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from "../../../../lib/db/db";


export async function POST(req: NextRequest) {
  try {

    
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM subjects ")

    if(rows.length > 0)
    {
        const subjects = rows;

        return NextResponse.json(
            {
                success: true,
                data: subjects
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
                message: "You Enter invlaid University",
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