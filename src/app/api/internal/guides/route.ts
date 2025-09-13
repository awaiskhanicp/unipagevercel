import { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "../../../../lib/db/db"
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "../../../utils/verifyAuthentication";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 15;
    const search = searchParams.get('search') || '';
    const featured = searchParams.get('featured') || '';
    const active = searchParams.get('active') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    console.log('🔍 Guides API called with params:', { page, limit, search, featured, active, startDate, endDate });

    // Build WHERE clause for filtering
    let whereClauses = [];
    let queryParams = [];

    // Add search filter
    if (search) {
      whereClauses.push(`
        (title LIKE ? OR sub_title LIKE ? OR guide_type LIKE ?)
      `);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Add featured filter
    if (featured !== '') {
      whereClauses.push('is_featured = ?');
      queryParams.push(featured === 'true' ? 1 : 0);
    }

    // Add active filter
    if (active !== '') {
      whereClauses.push('is_active = ?');
      queryParams.push(active === 'true' ? 1 : 0);
    }

    // Add date filters
    if (startDate) {
      whereClauses.push('created_at >= ?');
      queryParams.push(new Date(startDate).toISOString().slice(0, 19).replace('T', ' ')); // Format to 'YYYY-MM-DD HH:MM:SS'
    }
    if (endDate) {
      whereClauses.push('created_at <= ?');
      queryParams.push(new Date(endDate).toISOString().slice(0, 19).replace('T', ' ')); // Format to 'YYYY-MM-DD HH:MM:SS'
    }

    // Combine where clauses
    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) AS totalItems FROM guides ${whereClause}`;
    const [countResults] = await pool.query<RowDataPacket[]>(countQuery, queryParams);
    const totalItems = countResults[0].totalItems;
    const totalPages = Math.ceil(totalItems / limit);

    console.log('🔍 Total guides in database:', totalItems);
    console.log('🔍 Total pages:', totalPages);

    // Calculate pagination (OFFSET)
    const offset = (page - 1) * limit;

    // Fetch guides with pagination
    const guidesQuery = `
      SELECT id, title, sub_title, description, image, guide_type, university_id, subject_id, slug, sort_order, 
             is_active, is_featured, sm_question, sm_answer, review_detail, seo, created_at, updated_at
      FROM guides
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?;
    `;
    const [guides] = await pool.query<RowDataPacket[]>(guidesQuery, [...queryParams, limit, offset]);

    console.log('🔍 Fetched guides count:', guides.length);

    return Response.json({
      success: true,
      data: guides,
      meta: {
        totalItems: totalItems,
        totalPages: totalPages,
        currentPage: page,
        limit: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('🔍 Error in guides API:', error);
    return Response.json({
      success: false,
      error: 'Failed to fetch guides',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();

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

    const decoded = await verifyAuthentication(token)

    if (decoded instanceof NextResponse) {
      return NextResponse.json(
        {
          message: "You are not authorized to do this action"
        },
        {
          status: 403
        }
      );
    }


    const {type, type_id, title, show_meta, slug, description, is_active, meta_title="", meta_description = "", meta_keywords ="", image} = body;

    // check fot required fields
    if (!type || !title || !slug || !type_id) {
      return Response.json({
        success: false,
        message: 'Required fields are missing Like Title, Slug, Guide Type and University or Subject'
      }, { status: 400 });
    }


    let university_id = null;
    let subject_id = null;

    if(type === "University"){
      university_id = type_id;
      subject_id = null;
    } else if(type === "Subject"){
      subject_id = type_id;
      university_id = null;
    }


    let seo = null;

    if(show_meta === "on"){
      seo = {
        meta_title,
        meta_description,
        meta_keywords
      }
    }

    let image_url = null;

    if(image){
      image_url = image;
    }

    // Construct the SQL query to insert a new guide
    const query = `
      INSERT INTO guides (
        user_id,
        guide_type,
        university_id,
        subject_id,
        title,
        slug,
        description,
        is_active,
        seo,
        image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    // Set the values for the placeholders in the query
    const values = [
      decoded.id, // Default user_id to 1 if not provided
      type,
      university_id ? Number(university_id) : null, // Ensure university_id is a number or null
      subject_id ? Number(subject_id) : null, // Ensure subject_id is a number or null
      title,
      slug,
      description,
      is_active !== undefined ? (is_active ? 1 : 0) : 1, // Default is_active to 1 if not provided
      seo ? JSON.stringify(seo) : null,
      image_url
    ];

    // Execute the query using mysql2's 'execute' method
    const [result] = await pool.query<ResultSetHeader>(query, values);

    // Return the newly created guide's data
    return Response.json({
      success: true,
      data: {
        id: result.insertId, // The ID of the newly created guide
      },
      message: 'Guide created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('🔍 Error creating guide:', error);
    return Response.json({
      success: false,
      message: 'Failed to create guide',
      details: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Guide ID is required'
      }), { status: 400 });
    }

    const body = await request.json();
    
    // Prepare the fields for the update
    const updateData = {
      guide_type: body.guide_type,
      university_id: body.university_id ? Number(body.university_id) : null,
      subject_id: body.subject_id ? Number(body.subject_id) : null,
      title: body.title,
      image_URL: body.image,
      slug: body.slug,
      sort_order: body.sort_order ? Number(body.sort_order) : 0,
      description: body.description,
      is_active: body.is_active !== undefined ? (body.is_active ? 1 : 0) : 1,
      seo: body.seo ? JSON.stringify(body.seo) : null,
    };

    // SQL query to update the guide
    const sqlQuery = `
      UPDATE guides
      SET guide_type = ?, university_id = ?, subject_id = ?, title = ?, slug = ?, 
          sub_title = ?, description = ?, is_active = ?, seo = ?, image = ?
      WHERE id = ?
    `;

    // Execute the query
    const [result] = await pool.query(sqlQuery, [
      updateData.guide_type,
      updateData.university_id,
      updateData.subject_id,
      updateData.title,
      updateData.slug,
      updateData.sort_order,
      updateData.description,
      updateData.is_active,
      updateData.seo,
      updateData.image_URL,
      parseInt(id),
    ]);

    return new Response(JSON.stringify({
      success: true,
      data: result,
      message: 'Guide updated successfully'
    }));

  } catch (error) {
    console.error('🔍 Error updating guide:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to update guide',
      details: error.message
    }), { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({
        success: false,
        error: 'Guide ID is required'
      }, { status: 400 });
    }

    const body = await request.json();

    const {is_featured} = body;
    
    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM guides WHERE id = ?', [parseInt(id)]);

    if(result.length === 0)
    {
      return NextResponse.json(
        {
          message: "Guide not found"
        },
        {
          status: 404
        }
      );
    }

    const updateGuide = await pool.query<ResultSetHeader>("UPDATE guides SET is_featured = ? WHERE id = ?", [is_featured, parseInt(id)]);

    if(updateGuide[0].affectedRows === 0)
    {
      return NextResponse.json(
        {
          message: "Failed to update guide"
        },
        {
          status: 500
        }
      );
    }

    const freshGuide = await pool.query<RowDataPacket[]>("SELECT * FROM guides WHERE id = ?", [parseInt(id)])

    return Response.json({
      success: true,
      data: freshGuide,
      message: 'Guide updated successfully'
    });

  } catch (error) {
    console.error('🔍 Error updating guide:', error);
    return Response.json({
      success: false,
      error: 'Failed to update guide',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return Response.json({
        success: false,
        error: 'Guide ID is required'
      }, { status: 400 });
    }

    const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM guides WHERE id = ?', [parseInt(id)]);

    if(result.length === 0)
    {
      return NextResponse.json(
        {
          message: "Guide not found"
        },
        {
          status: 404
        }
      );
    }

    await pool.query<ResultSetHeader>("DELETE FROM guides WHERE id = ?", [parseInt(id)]);

    return Response.json({
      success: true,
      message: 'Guide deleted successfully'
    });

  } catch (error) {
    console.error('🔍 Error deleting guide:', error);
    return Response.json({
      success: false,
      error: 'Failed to delete guide',
      details: error.message
    }, { status: 500 });
  }
}