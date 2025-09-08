// app/api/internal/visa-country/[id]/route.js
import { NextResponse } from 'next/server';
import {prisma} from '../../../../../lib/prisma';

export async function GET(request, { params }) {
  try {
    // Validate id exists
    if (!params.id || isNaN(params.id)) {
      return NextResponse.json(
        { error: 'Valid country ID is required' },
        { status: 400 }
      );
    }

    const country = await prisma.visa_countries.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: country
    });

  } catch (error) {
    console.error('Error fetching country:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}