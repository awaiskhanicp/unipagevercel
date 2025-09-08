import { NextResponse } from 'next/server';
import {prisma} from '../../../../lib/prisma';

export async function POST(request) {
  try {
    const {
      visa_country_id,
      visa_type_id,
      title,
      description,
      visa_country_name,
      visa_type_name
    } = await request.json();

    // Validate required fields
    if (!visa_country_id || !visa_type_id || !title || !description) {
      return NextResponse.json(
        { error: 'Required fields are missing' },
        { status: 400 }
      );
    }

    // Create new visa requirement
    const visaRequirement = await prisma.visa_requirements.create({
      data: {
        visa_country_id: parseInt(visa_country_id),
        visa_type_id: parseInt(visa_type_id),
        title,
        description,
        visa_country_name,
        visa_type_name,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    return NextResponse.json(
      { message: 'Visa requirement created successfully', data: visaRequirement },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating visa requirement:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}



export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const countryId = searchParams.get('visa_country_id');
    const typeId = searchParams.get('visa_type_id');
    const getAll = searchParams.get('get_all');

    // Build where clause
    const where = {};
    if (countryId) where.visa_country_id = parseInt(countryId);
    if (typeId) where.visa_type_id = parseInt(typeId);

    // Get visa requirements with optional filtering
    const requirements = await prisma.visa_requirements.findMany({
      where,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        // Include country and type information for admin view
        ...(getAll === 'true' && {
          // You can add relations here if they exist in schema
        })
      }
    });

    return NextResponse.json(
      { 
        success: true,
        data: requirements,
        total: requirements.length,
        message: getAll === 'true' ? 'All visa requirements fetched' : 'Filtered visa requirements fetched'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching visa requirements:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}