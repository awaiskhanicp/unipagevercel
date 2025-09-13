import { NextResponse } from "next/server";
import pool from "../../../../../lib/db/db";
import ResultSetHeader from "mysql2"

// GET single course by ID
/*export async function GET(request, { params }) {
  const id = parseInt(params.id);
  
  try {
    // 1. Fetch the course
    const course = await prisma.courses.findUnique({
      where: { id }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" }, 
        { status: 404 }
      );
    }

    console.log("🔍 Course Data:", JSON.stringify(course, null, 2));

    // 2. Check if university_id exists
    if (!course.university_id) {
      console.warn("⚠️ No university_id found in course!");
    } else {
      console.log(`🔄 Attempting to fetch university with ID: ${course.university_id}`);
      
      // 3. Try fetching university data
      try {
        const university = await prisma.university_details.findUnique({
          where: { id: course.university_id },
          select: {
            name: true,
            alternate_email: true,
            logo: true,
            city: true,
            country: true,
            active: true
          }
        });

        console.log("✅ University Data:", university);

        if (!university) {
          console.error(`❌ University with ID ${course.university_id} NOT FOUND in database!`);
          
          // Verify if university exists (direct query)
          const universityExists = await prisma.university_details.count({
            where: { id: course.university_id }
          });
          
          console.log(`🔍 Does university exist? ${universityExists ? "YES" : "NO"}`);
        }

        // 4. Construct response
        const responseData = {
          success: true,
          data: {
            ...course,
            university_info: university || null,
            university_alternate_email: university?.alternate_email || null,
            university_name: university?.name || null,
            university_logo: university?.logo || null,
            location: university ? `${university.city}, ${university.country}` : null,
          }
        };

        return NextResponse.json(responseData, { status: 200 });

      } catch (universityError) {
        console.error("❌ Error fetching university:", universityError);
        return NextResponse.json(
          { success: false, error: "Failed to fetch university data" },
          { status: 500 }
        );
      }
    }

    // If no university_id, return course without university data
    return NextResponse.json({
      success: true,
      data: {
        ...course,
        university_info: null,
        university_alternate_email: null,
        university_name: null,
        university_logo: null,
        location: null,
      }
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error in GET /api/courses/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}*/
// PUT update course by ID
export async function PUT(req, { params }) {

  const {id} = await params;

  try {
    const data = await req.json();

    // Build the SQL UPDATE query
    const query = `
      UPDATE courses 
      SET 
        name = ?, 
        university_id = ?, 
        subject_id = ?, 
        review_detail = ?, 
        rating_count = ?, 
        review_count = ?, 
        avg_review_value = ?, 
        qualification = ?, 
        duration = ?, 
        duration_qty = ?, 
        duration_type = ?, 
        yearly_fee = ?, 
        application_fee = ?, 
        languages = ?, 
        starting_date = ?, 
        deadline = ?, 
        about = ?, 
        entry_requirments = ?, 
        curriculum = ?, 
        scholarship = ?, 
        sort_order = ?, 
        active = ?, 
        display = ?
      WHERE id = ?
    `;

    // Set the parameters for the query
    const params = [
      data.name,
      data.university_id,
      data.subject_id,
      data.review_detail,
      data.rating_count,
      data.review_count,
      data.avg_review_value,
      data.qualification,
      data.duration,
      data.duration_qty,
      data.duration_type,
      data.yearly_fee,
      data.application_fee,
      data.languages,
      data.starting_date ? new Date(data.starting_date) : null,
      data.deadline ? new Date(data.deadline) : null,
      data.about,
      data.entry_requirments,
      data.curriculum,
      data.scholarship,
      data.sort_order,
      data.active,
      data.display,
      id, // course ID
    ];

    // Execute the query using the pool
    const [result] = await pool.execute(query, params); // Destructure the result to get the ResultSetHeader

    // Check if any rows were affected
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Course not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Course updated successfully" });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE course by ID
export async function DELETE(req, { params }) {

  const id = parseInt(params.id);
  
  try {
    // Delete the course by id
    const [result] = await pool.execute(
      'DELETE FROM courses WHERE id = ?',
      [id]
    );

    // Check if any row was affected
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } 
}