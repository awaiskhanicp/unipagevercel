import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { RowDataPacket } from "mysql2";


export async function POST(req: NextRequest) {
  
    try{

        const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM job_opprtunities WHERE post_status = 1")

        if(rows.length === 0) {
            return Response.json(
                {
                    message: 'No jobs found',
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: 'Jobs found',
                data: rows,
            },
            { status: 200 }
        )
        
    } catch (error) {
    console.error('Database error:', error);
    return Response.json(
      {
        error: 'Failed to fetch jobs',
        details: {
          message: error.message,
          code: error.code,
          meta: error.meta,
        },
      },
      { status: 500 }
    );
  }
}