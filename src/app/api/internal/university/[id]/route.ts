// app/api/internal/auth/users/[id]/route.js
import { verifyAuthentication } from "../../../../utils/verifyAuthentication";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export async function GET(request: NextRequest, { params }) {
  const { id: slug } = params;
  
  try {
    // Fetch the university details
    const [universityRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM university_details WHERE slug = ? AND display = true AND active = true`,
      [slug]
    );
    
    if (universityRows.length === 0) {
      return Response.json(
        { error: 'University not found' }, 
        { status: 404 }
      );
    }

    const university = universityRows[0];

    // Fetch country information if university has a country
    let countryData = null;
    if (university.country) {
      try {
        const [countryRows] = await pool.query<RowDataPacket[]>(
          `SELECT consultation_fee, consultation_fee_discount, currency 
           FROM countries 
           WHERE country = ?`,
          [university.country]
        );

        if (countryRows.length > 0) {
          countryData = countryRows[0];
        }
      } catch (countryError) {
        console.error(`Error fetching country data for ${university.country}:`, countryError);
        countryData = null;
      }
    }

    // Combine university data with country data
    const responseData = {
      ...university,
      country_info: countryData ? {
        consultation_fee: countryData.consultation_fee,
        consultation_fee_discount: countryData.consultation_fee_discount,
        currency: countryData.currency
      } : null
    };

    return Response.json(responseData, { status: 200 });

  } catch (error) {
    console.error('Error fetching university:', error);
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }) {

  const token = request.cookies.get("university-token")?.value || null;

  if (!token) {
    return NextResponse.json(
      {
        message: "Please Login to continue"
      },
      {
        status: 400
      }
    );
  }

  const decoded = await verifyAuthentication(token);

  if (decoded instanceof NextResponse) {
    return NextResponse.json(
      {
        message: "You are not authorized to do this action"
      },
      {
        status: 400
      }
    );
  }

  const { id } = await params;
  
  if (!id || isNaN(parseInt(id))) {
    return Response.json({ error: 'Invalid university ID' }, { status: 400 });
  }
  
  const data = await request.json();

  try {
    // Helper functions for data processing
    const safeParseJson = (value) => {
      if (!value) return null;
      if (typeof value === 'object') return value;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return value;
        }
      }
      return value;
    };

    const convertArrayToString = (value) => {
      if (Array.isArray(value)) {
        return JSON.stringify(value);
      }
      return value;
    };

    // Process data fields
    const phoneNo = data.phone_no || null;
    
    const totalStudents = data.total_students ? 
      parseInt(data.total_students) : null;
    
    const internationalStudent = data.international_student ? 
      parseInt(data.international_student) : null;
    
    const scholarshipValue = data.scholarship === "Yes" ? 1 : 0;

    // Prepare final data for MySQL
    const finalData = {
      name: data.name,
      founded_in: data.founded_in,
      country: data.country,
      city: data.city,
      address: data.address,
      postcode: data.postcode,
      phone_no: phoneNo,
      agency_number: data.agency_number,
      total_students: totalStudents,
      international_student: internationalStudent,
      scholarship: scholarshipValue,
      about: data.about,
      guide: data.guide,
      expanse: data.expanse,
      languages: data.languages,
      accommodation: data.accommodation,
      accommodation_detail: data.accommodation_detail,
      intake: data.intake,
      ranking: data.ranking,
      designation: data.designation,
      alternate_email: data.alternate_email,
      website: data.website,
      popular: data.popular,
      review_detail: convertArrayToString(safeParseJson(data.review_detail)),
      logo: data.logo_url || null,
      feature_image: data.feature_image_url || null,
    };

    // Build the SQL UPDATE query
    const query = `
      UPDATE university_details 
      SET
        name = ?, 
        founded_in = ?, 
        country = ?, 
        city = ?, 
        address = ?, 
        postcode = ?, 
        phone_no = ?, 
        agency_number = ?, 
        total_students = ?, 
        international_student = ?, 
        scholarship = ?, 
        about = ?, 
        guide = ?, 
        expanse = ?, 
        languages = ?, 
        accommodation = ?, 
        accommodation_detail = ?, 
        intake = ?, 
        ranking = ?, 
        designation = ?, 
        alternate_email = ?, 
        website = ?, 
        popular = ?, 
        review_detail = ?, 
        logo = ?, 
        feature_image = ?
      WHERE id = ?`;

    // Execute the query with the final data
    const [updatedUniversity] = await pool.query<ResultSetHeader>(query, [
      finalData.name,
      finalData.founded_in,
      finalData.country,
      finalData.city,
      finalData.address,
      finalData.postcode,
      finalData.phone_no,
      finalData.agency_number,
      finalData.total_students,
      finalData.international_student,
      finalData.scholarship,
      finalData.about,
      finalData.guide,
      finalData.expanse,
      finalData.languages,
      finalData.accommodation,
      finalData.accommodation_detail,
      finalData.intake,
      finalData.ranking,
      finalData.designation,
      finalData.alternate_email,
      finalData.website,
      finalData.popular,
      finalData.review_detail,
      finalData.logo,
      finalData.feature_image,
      id, // University ID for WHERE clause
    ]);

    if(updatedUniversity.affectedRows > 0)
    {
      const [rows] = await pool.query<RowDataPacket[]>(`SELECT * FROM university_details WHERE id = ?`, [id]);

      if(rows.length > 0){
        return Response.json( 
          {
            data: rows[0]
          }, 
          { 
            status: 200 
          }
        );
      }else{
        return Response.json({ error: 'Something went wrong.' }, { status: 500 });
      }
      
    }
    else
    {
      return NextResponse.json(
        { error: 'Error Updating University' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating university:', error);

    return Response.json({ 
      error: 'Failed to update university', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }) {
  const token = request.cookies.get("university-token")?.value || null;

  if (!token) {
    return NextResponse.json(
      {
        message: "Please Login to continue"
      },
      {
        status: 400
      }
    );
  }

  const decoded = await verifyAuthentication(token);

  if (decoded instanceof NextResponse) {
    return NextResponse.json(
      {
        message: "You are not authorized to do this action"
      },
      {
        status: 400
      }
    );
  }

  const { id } = params;

  if (!id || isNaN(parseInt(id))) {
    return NextResponse.json(
      { error: 'Invalid university ID' },
      { status: 400 }
    );
  }

  try {
    // Build the SQL DELETE query
    const query = `DELETE FROM university_details WHERE id = ?`;

    // Execute the query
    const [result] = await pool.execute<RowDataPacket[]>(query, [parseInt(id)]);

    if (result.length === 0) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 });
    }

    // Return a 204 No Content response if successfully deleted
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting university:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }) {
  const token = request.cookies.get("university-token")?.value || null;

  if (!token) {
    return NextResponse.json(
      {
        message: "Please Login to continue"
      },
      {
        status: 400
      }
    );
  }

  const decoded = await verifyAuthentication(token);

  if (decoded instanceof NextResponse) {
    return NextResponse.json(
      {
        message: "You are not authorized to do this action"
      },
      {
        status: 400
      }
    );
  }

  const { id } = await params;
  const data = await request.json();

  try {
    // Process popular field value
    const popularValue = data.popular === 'true' || data.popular === true;

    // Build the SQL UPDATE query
    const query = `
      UPDATE university_details
      SET popular = ?
      WHERE id = ?
    `;

    // Execute the query with the processed data
    const [result] = await pool.execute<ResultSetHeader>(query, [
      popularValue,
      parseInt(id), // University ID for WHERE clause
    ]);

    // Now, run a SELECT query to get the updated data
    const [updatedUniversity] = await pool.query<RowDataPacket[]>("SELECT * FROM university_details WHERE id = ?", [
      parseInt(id), // University ID to fetch the updated data
    ]);

    return Response.json(updatedUniversity[0], { status: 200 });
  } catch (error) {
    console.error('Error updating university (PATCH):', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}