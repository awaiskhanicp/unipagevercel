import pool from '../../../../lib/db/db';
import { NextRequest, NextResponse } from 'next/server';
import { FreeConsultationSchemaSoft as Schema } from '../../../../validations/freeconsultation';
import { ResultSetHeader, RowDataPacket } from 'mysql2';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const lastEducation = searchParams.get('last_education') || '';
    const interestedCountry = searchParams.get('interested_country') || '';

    console.log('Filter params:', { search, startDate, endDate, lastEducation, interestedCountry });

    const skip = (page - 1) * limit;
    
    let whereClauses = [];
    let values = [];

    if (search) {
      const searchWords = search.split(/\s+/).filter(Boolean);
      if (searchWords.length > 0) {
        searchWords.forEach((word, index) => {
          whereClauses.push(`(name LIKE ? OR email LIKE ? OR phone_number LIKE ? OR apply_for LIKE ? OR interested_country LIKE ? OR city LIKE ? OR last_education LIKE ? OR country LIKE ?)`);
          const wordValue = `%${word}%`;
          values.push(...Array(8).fill(wordValue));
        });
      }
    }


    if (startDate || endDate) {
      if (startDate) {
        whereClauses.push(`created_at >= ?`);
        values.push(`${startDate}T00:00:00Z`);
      }
      if (endDate) {
        whereClauses.push(`created_at <= ?`);
        values.push(`${endDate}T23:59:59Z`);
      }
    }


    if (lastEducation) {
      whereClauses.push(`last_education = ?`);
      values.push(lastEducation);
    }


    if (interestedCountry) {
      whereClauses.push(`interested_country = ?`);
      values.push(interestedCountry);
    }

    const whereClauseString = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';
    console.log('Where clause:', whereClauseString);


    const countQuery = `SELECT COUNT(*) as totalCount FROM free_consulations ${whereClauseString}`;
    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, values);
    const totalCount = countResult[0].totalCount;

    const recordsQuery = `
      SELECT * FROM free_consulations
      ${whereClauseString}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    values.push(limit, skip);
    const [records] = await pool.execute(recordsQuery, values);


    if (lastEducation || startDate || endDate) {

      countResult.slice(0, 3).forEach((record, index) => { // Apply slice on 'rows'
        console.log(`Record ${index + 1}:`, {
          id: record.id,
          name: record.name,
          last_education: record.last_education,
          created_at: record.created_at
        });
      });
    }


    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: records,
      meta: {
        totalItems: totalCount,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch consultations',
        message: process.env.NODE_ENV === 'development' ? error.message : null
      }, 
      { status: 500 }
    );
  }
}

// POST create new consultation
export async function POST(req) {
  try {
    const body = await req.json();

    const parsed = Schema.parse(body);

    const { name, email, phone_number, last_education, country, city, interested_country, apply_for } = parsed;

    /*const [ checkEmail ] = await pool.query<RowDataPacket[]>("SELECT * FROM free_consulations WHERE email = ?", [email])
    
    if(checkEmail.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 409 }
      );
    }*/

    const [getcountry] = await pool.query<RowDataPacket[]>("SELECT * FROM countries_db WHERE id = ?", [country])
    const [getcity] = await pool.query<RowDataPacket[]>("SELECT * FROM cities_db WHERE id = ?", [city])

    if(getcountry.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Country not found' },
        { status: 404 }
      );
    }

    if(getcity.length === 0){
      return NextResponse.json(
        { success: false, message: 'City not found' },
        { status: 404 }
      );
    }

    const [new_consultation] = await pool.query<ResultSetHeader>("INSERT INTO free_consulations (name, email, phone_number, last_education, country, city, interested_country, apply_for) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [name, email, phone_number, last_education, getcountry[0].name, getcity[0].name, interested_country, apply_for]);

    if(new_consultation.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to create consultation' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Consultation created successfully' },
      { status: 200 }
    );

  } catch (err: any) {
    if (err?.issues) {
      // ZodError
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of err.issues) {
        const key = (issue.path?.[0] as string) ?? '_';
        fieldErrors[key] = fieldErrors[key] || [];
        fieldErrors[key].push(issue.message);
      }
      return NextResponse.json(
        { ok: false, errors: fieldErrors },
        { status: 400 }
      );
    }

    console.error("freeconsulation POST error:", err);
    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}