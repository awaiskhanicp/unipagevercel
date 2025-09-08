import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.visa_country_id || !data.name || !data.country_name) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Create visa type
    const visaType = await prisma.visa_types.create({
      data: {
        visa_country_id: parseInt(data.visa_country_id),
        name: data.name,
        country_name: data.country_name,
      },
    });

    return NextResponse.json({
      success: true,
      data: visaType
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating visa type:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const visa_country_id = searchParams.get('visa_country_id');
    const getAll = searchParams.get('get_all');

    let where = {};
    
    // If get_all is true, fetch all visa types, otherwise require country ID
    if (getAll !== 'true' && !visa_country_id) {
      return NextResponse.json(
        { success: false, message: 'visa_country_id is required or use get_all=true' },
        { status: 400 }
      );
    }
    
    if (visa_country_id) {
      where.visa_country_id = parseInt(visa_country_id);
    }

    const visaTypes = await prisma.visa_types.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: visaTypes,
      total: visaTypes.length,
      message: getAll === 'true' ? 'All visa types fetched' : 'Filtered visa types fetched'
    });

  } catch (error) {
    console.error('Error fetching visa types:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch visa types' },
      { status: 500 }
    );
  }
}