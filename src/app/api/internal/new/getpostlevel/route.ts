
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from "../../../../../lib/db/db";


export async function POST() {
  try {
    
    const [rows] = await pool.query<RowDataPacket[]>("SELECT id, title FROM posts WHERE is_active = 1")

    if(rows.length > 0)
    {
        const posts = rows;

        return NextResponse.json(
            {
                success: true,
                data: posts
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
                message: "Unable to fetch posts",
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