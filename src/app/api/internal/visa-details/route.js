import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET - Fetch visa details
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const country_id = searchParams.get('country_id');

    if (!country_id) {
      return NextResponse.json(
        { success: false, message: 'country_id is required' },
        { status: 400 }
      );
    }

    const visaDetails = await prisma.visa_details.findMany({
      where: {
        country_id: parseInt(country_id)
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: visaDetails
    });

  } catch (error) {
    console.error('Error fetching visa details:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visa details' },
      { status: 500 }
    );
  }
}

// POST - Create new visa detail
export async function POST(req) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.visa_title || !data.visa_description || !data.country_id) {
      return NextResponse.json(
        { success: false, message: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Create slug from visa title
    const slug = data.visa_title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    const visaDetail = await prisma.visa_details.create({
      data: {
        visa_title: data.visa_title,
        visa_description: data.visa_description,
        country_id: parseInt(data.country_id),
        slug,
        sm_question: data.sm_question || '',
        sm_answer: data.sm_answer || '',
        visa_image: data.visa_image || '',
        // Set default values for other fields
        rating_count: 0,
        review_count: 0,
        avg_review_value: 0,
        choosable_status: 'Pending'
      }
    });

    return NextResponse.json({
      success: true,
      data: visaDetail
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating visa detail:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create visa detail' },
      { status: 500 }
    );
  }
}