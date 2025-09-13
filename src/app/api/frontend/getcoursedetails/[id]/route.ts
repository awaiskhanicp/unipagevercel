
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
    
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        c.id AS id,
        c.name AS name, 
        c.duration AS duration,
        c.duration_type AS duration_type,
        c.yearly_fee AS yearly_fee,
        c.scholarship AS scholarship,
        c.university_id AS university_id,
        c.subject_id AS subject_id,
        c.qualification AS qualification,
        ud.name AS university_name,
        ud.logo AS universityLogo,
        ud.intake AS intake,
        ud.address AS location,
        s.name AS subject_name,
        co.currency AS currency,
        co.consultation_fee AS consultation_fee,
        co.consultation_fee_discount AS consultation_fee_discount,
        (co.consultation_fee - (co.consultation_fee * (co.consultation_fee_discount / 100))) AS consultation_fee_after_discount,
        p.title AS qualification
      FROM courses c
      LEFT JOIN university_details ud ON c.university_id = ud.id
      LEFT JOIN subjects s ON c.subject_id = s.id
      LEFT JOIN countries co ON ud.country = co.country
      LEFT JOIN posts p ON c.qualification = p.id
      WHERE c.id = ?`, [id]
    )

    if(rows.length > 0)
    {
        const course = rows[0];

        const [relatedcourse] = await pool.query<RowDataPacket[]>(
          `SELECT 
            c.id AS id,
            c.name AS name,
            c.university_id AS university_id,
            ud.name AS university_name,
            ud.address AS location
          FROM courses c
          LEFT JOIN university_details ud ON c.university_id = ud.id
          WHERE c.university_id = ? AND c.id != ? LIMIT 3`, [course.university_id, course.id])

        if(relatedcourse.length > 0)
        {
            return NextResponse.json(
              {
                success: true,
                data: course,
                relatedcourse: relatedcourse
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
                  data: course
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