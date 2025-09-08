import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET() {
  try {
    // Get all courses with their qualification data
    const courses = await prisma.courses.findMany({
      select: {
        id: true,
        name: true,
        qualification: true,
      },
      take: 20 // Limit to first 20 for debugging
    });

    // Get all posts that might be qualifications
    const posts = await prisma.posts.findMany({
      where: {
        title: {
          in: ['Bachelor', 'Masters', 'Doctorate', 'Diploma', 'Certificate', 'Foundation']
        }
      },
      select: {
        id: true,
        title: true,
        post_type: true
      }
    });

    return NextResponse.json({
      success: true,
      courses: courses,
      qualificationPosts: posts,
      summary: {
        totalCourses: courses.length,
        coursesWithQualification: courses.filter(c => c.qualification).length,
        coursesWithoutQualification: courses.filter(c => !c.qualification).length,
        qualificationTypes: [...new Set(courses.map(c => c.qualification).filter(Boolean))],
        qualificationTypesCount: courses.reduce((acc, c) => {
          if (c.qualification) {
            acc[c.qualification] = (acc[c.qualification] || 0) + 1;
          }
          return acc;
        }, {})
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
