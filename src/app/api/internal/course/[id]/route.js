import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

// GET single course by ID
export async function GET(request, { params }) {
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
}
// PUT update course by ID
export async function PUT(req, { params }) {
  const id = parseInt(params.id);
  try {
    const data = await req.json();

    const updatedCourse = await prisma.courses.update({
      where: { id },
      data: {
        name: data.name,
        university_id: data.university_id,
        subject_id: data.subject_id,
        sm_question: data.sm_question,
        sm_answer: data.sm_answer,
        review_detail: data.review_detail,
        rating_count: data.rating_count,
        review_count: data.review_count,
        avg_review_value: data.avg_review_value,
        qualification: data.qualification,
        duration: data.duration,
        duration_qty: data.duration_qty,
        duration_type: data.duration_type,
        yearly_fee: data.yearly_fee,
        application_fee: data.application_fee,
        languages: data.languages,
        starting_date: data.starting_date ? new Date(data.starting_date) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        about: data.about,
        entry_requirments: data.entry_requirments,
        curriculum: data.curriculum,
        scholarship: data.scholarship,
        sort_order: data.sort_order,
        active: data.active,
        display: data.display,
        popular: data.popular,
      },
    });

    return NextResponse.json({ success: true, data: updatedCourse });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE course by ID
export async function DELETE(req, { params }) {
  const id = parseInt(params.id);
  try {
    await prisma.courses.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}