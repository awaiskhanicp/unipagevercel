// app/api/countries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '../../../../lib/db/db';
import { RowDataPacket } from "mysql2";

export async function GET(req: NextRequest) {

    try{
        const countryId = Number(new URL(req.url).searchParams.get('countryId'));
        if (!countryId) return NextResponse.json([]);

        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT id, name FROM states_db WHERE country_id = ? ORDER BY name ASC',
            [countryId]
        );

        if(rows.length === 0)
        {
            return NextResponse.json(
            {
                message: "No States found"
            },
            {
                status: 404
            }
            );
        }
        
        
        return NextResponse.json(
            {
                message: "States found",
                states: rows
            },
            {
                status: 200,
                headers: {
                'Cache-Control': 'public, max-age=3600',
                },
            }
        );

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                message: "Something went wrong"
            }
            ,
            {
                status: 500
            }
        );
    }
}
