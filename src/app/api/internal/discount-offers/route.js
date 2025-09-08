import { prisma } from '../../../../lib/prisma';
import { NextResponse } from 'next/server';


export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and phone are required' },
        { status: 400 }
      );
    }

    // Create new discount offer with all required fields (match Prisma schema types)
    const newOffer = await prisma.discountoffers.create({
      data: {
        name: String(body.name || ''),
        email: String(body.email || ''),
        phone: String(body.phone || ''),
        // Map form fields to model fields (all are Strings in schema)
        lastEducation: String(body.education || ''),
        lastEducationPer: String(body.percentage || ''),
        city: String(body.city || ''),
        location: String(body.location || ''),
        familyDetail: String(body.details || ''),
        // Int flags in schema
        emailSended: 0,
        smsSended: 0,
      }
    });

    return NextResponse.json(
      { success: true, data: newOffer },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating discount offer:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create discount offer',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const offers = await prisma.discountoffers.findMany({
      orderBy: {
        created_at: 'desc'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        lastEducation: true,
        lastEducationPer: true,
        city: true,
        location: true,
        created_at: true
      }
    });

    return NextResponse.json(
      { success: true, data: offers },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching discount offers:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch discount offers',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}