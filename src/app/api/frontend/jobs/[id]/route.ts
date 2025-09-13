import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../../lib/db/db';
import { RowDataPacket } from "mysql2";


export async function GET(request: NextRequest, {params}) {

    const {id} = await params;
    const jobId = parseInt(id);
    
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM job_opprtunities WHERE id = ?", [jobId]);

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
            data: rows[0],
        },
        { status: 200 }
    )
}