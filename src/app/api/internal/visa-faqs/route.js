import { NextResponse } from 'next/server';
import {prisma} from '../../../../lib/prisma';

// GET all FAQs for a country or all FAQs if no country specified
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('visa_country_id');
    const getAll = searchParams.get('get_all');
    
    let where = {};
    
    // If get_all is true, fetch all FAQs, otherwise require country ID
    if (getAll !== 'true' && !countryId) {
      return NextResponse.json(
        { message: 'Country ID is required or use get_all=true' },
        { status: 400 }
      );
    }
    
    if (countryId) {
      where.visa_country_id = parseInt(countryId);
    }

    const faqs = await prisma.visa_faqs.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ 
      success: true,
      data: faqs,
      total: faqs.length,
      message: getAll === 'true' ? 'All visa FAQs fetched' : 'Filtered visa FAQs fetched'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch FAQs', error: error.message },
      { status: 500 }
    );
  }
}

// POST create new FAQ
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.visa_country_id || !body.visa_type_id || !body.title || !body.description) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const newFaq = await prisma.visa_faqs.create({
      data: {
        visa_country_id: parseInt(body.visa_country_id),
        visa_type_id: parseInt(body.visa_type_id),
        title: body.title,
        description: body.description,
        visa_country_name: body.visa_country_name,
        visa_type_name: body.visa_type_name,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(
      { message: 'FAQ created successfully', data: newFaq },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to create FAQ', error: error.message },
      { status: 500 }
    );
  }
}