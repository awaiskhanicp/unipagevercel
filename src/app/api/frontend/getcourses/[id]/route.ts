
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from "../../../../../lib/db/db";

type PageProps = {
    params: Promise<{
      id: string;
    }>;
  };

export async function POST(req: NextRequest, { params }: PageProps) {
  try {

    const {id} = await params // Access query parameter
    
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM courses WHERE university_id = ?", [id])

    if(rows.length > 0)
    {
        const courses = rows;

        return NextResponse.json(
            {
                success: true,
                data: courses
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
                message: "There is no course available for this university"
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