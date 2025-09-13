
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from "../../../../lib/db/db";


export async function POST(req: NextRequest) {
  try {

    
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM countries")

    if(rows.length > 0)
    {
        const countries = rows;

        return NextResponse.json(
            {
                success: true,
                data: countries
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
                message: "You Enter invlaid University"
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