
import { NextRequest, NextResponse } from 'next/server';
import { RowDataPacket } from 'mysql2';
import pool from "../../../../../lib/db/db"

type PageProps = {
    params: Promise<{
      slug: string;
    }>;
  };

export async function POST(req: NextRequest, { params }: PageProps) {
  try {

    const {slug} = await params // Access query parameter
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
      ud.*,
      co.currency AS currency,
      co.consultation_fee AS consultation_fee,
      co.consultation_fee_discount AS consultation_fee_discount,
      co.currency AS currency,
      (co.consultation_fee - (co.consultation_fee * (co.consultation_fee_discount / 100))) AS consultation_fee_after_discount
      FROM university_details ud
      LEFT JOIN countries co ON ud.country = co.country
      WHERE ud.slug = ?`, [slug])

    if(rows.length > 0)
    {
        const [relatedUniversities] = await pool.query<RowDataPacket[]>("SELECT id, name, slug, logo, feature_image FROM university_details WHERE slug != ? AND popular = 1 ORDER BY created_at DESC LIMIT 3", [rows[0].slug])

        if(relatedUniversities.length > 0)
        {

            return NextResponse.json(
                {
                    success: true,
                    data: rows[0],
                    realtedUniversities: relatedUniversities,
                },
                {
                    status: 200
                }
            )
        }
        else{
            return NextResponse.json(
                {
                    success: true,
                    data: rows[0],
                    realtedUniversities: relatedUniversities
                },
                {
                    status: 200
                }
            )
        }
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